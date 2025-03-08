import { type NextRequest, NextResponse } from "next/server"
import twilio from "twilio"

export async function POST(req: NextRequest) {
    try {
        const { to, message } = await req.json()

        // Validate input
        if (!to || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Initialize Twilio client
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

        // Send SMS
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to,
        })

        return NextResponse.json({ success: true, messageId: result.sid })
    } catch (error) {
        console.error("Error sending SMS:", error)
        return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 })
    }
}

