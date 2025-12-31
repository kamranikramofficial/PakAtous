import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/prisma";
import { ServiceRequest, ServiceImage } from "@/models/ServiceRequest";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { serviceRequestSchema } from "@/lib/validations";
import { generateServiceRequestNumber } from "@/lib/utils";
import { sendEmail, getServiceRequestEmailTemplate, getAdminNewServiceRequestNotificationTemplate, sendStaffNewServiceRequestEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';

// Get user's service requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const query: any = { userId: session.user.id };
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ServiceRequest.countDocuments(query),
    ]);

    // Get images for each request
    const requestIds = requests.map((r: any) => r._id);
    const images = await ServiceImage.find({ serviceRequestId: { $in: requestIds } }).lean();

    const requestsWithImages = requests.map((r: any) => ({
      ...r,
      id: r._id.toString(),
      images: images.filter((img: any) => img.serviceRequestId.toString() === r._id.toString()),
    }));

    return NextResponse.json({
      requests: requestsWithImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch service requests" },
      { status: 500 }
    );
  }
}

// Create new service request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const validationResult = serviceRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      requestNumber: generateServiceRequestNumber(),
      userId: session.user.id,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      serviceAddress: data.serviceAddress,
      serviceCity: data.serviceCity,
      serviceState: data.serviceState,
      serviceType: data.serviceType,
      priority: data.priority || "NORMAL",
      generatorBrand: data.generatorBrand,
      generatorModel: data.generatorModel,
      generatorSerial: data.generatorSerial,
      problemTitle: data.problemTitle,
      problemDescription: data.problemDescription,
      preferredDate: data.preferredDate,
    });

    // Create images if provided
    if (data.images?.length) {
      const imageDocuments = data.images.map((url: string) => ({
        url,
        serviceRequestId: serviceRequest._id,
      }));
      await ServiceImage.insertMany(imageDocuments);
    }

    // Create notification for user
    await Notification.create({
      userId: session.user.id,
      type: "SERVICE_REQUEST_SUBMITTED",
      title: "Service Request Submitted",
      message: `Your service request ${serviceRequest.requestNumber} has been submitted. We'll review it shortly.`,
      link: `/account/services/${serviceRequest._id}`,
      serviceRequestId: serviceRequest._id.toString(),
    });

    // Send confirmation email to user
    const serviceRequestObj = {
      ...serviceRequest.toObject(),
      id: serviceRequest._id.toString(),
    };
    const emailTemplate = getServiceRequestEmailTemplate(serviceRequestObj);
    await sendEmail({
      to: data.contactEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    // Notify admins and staff
    const adminStaff = await User.find({ role: { $in: ["ADMIN", "STAFF"] }, isActive: true }).select("_id email name role");

    const adminEmailTemplate = getAdminNewServiceRequestNotificationTemplate(serviceRequestObj);
    
    // Collect staff emails for batch notification
    const staffEmails: string[] = [];
    
    for (const member of adminStaff) {
      // Send email based on role
      if (member.role === "ADMIN") {
        await sendEmail({
          to: member.email,
          subject: adminEmailTemplate.subject,
          html: adminEmailTemplate.html,
        });
      } else {
        // Collect staff emails for batch notification
        staffEmails.push(member.email);
      }

      await Notification.create({
        userId: member._id,
        type: "SERVICE_REQUEST_SUBMITTED",
        title: "New Service Request",
        message: `New ${data.serviceType} request from ${data.contactName}${data.priority && data.priority !== "NORMAL" ? ` (${data.priority} priority)` : ""}`,
        link: member.role === "ADMIN" ? `/admin/services/${serviceRequest._id}` : `/staff/services/${serviceRequest._id}`,
        serviceRequestId: serviceRequest._id.toString(),
      });
    }
    
    // Send staff notification email
    if (staffEmails.length > 0) {
      await sendStaffNewServiceRequestEmail(serviceRequestObj, staffEmails);
    }

    return NextResponse.json({
      success: true,
      serviceRequest: {
        id: serviceRequest._id.toString(),
        requestNumber: serviceRequest.requestNumber,
      },
    });
  } catch (error) {
    console.error("Error creating service request:", error);
    return NextResponse.json(
      { error: "Failed to create service request" },
      { status: 500 }
    );
  }
}
