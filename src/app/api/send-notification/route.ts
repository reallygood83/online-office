import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

interface EmailRecipient {
  uid: string;
  email: string;
  displayName: string;
}

interface NotificationRequest {
  type: 'announcement' | 'reservation' | 'calendar';
  title: string;
  content: string;
  priority?: 'normal' | 'important' | 'urgent';
  recipients: EmailRecipient[];
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'urgent': return '🚨 긴급';
    case 'important': return '⚠️ 중요';
    default: return '📢 일반';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return '#FF4444';
    case 'important': return '#FFB800';
    default: return '#4ECDC4';
  }
}

function generateEmailHtml(
  title: string, 
  content: string, 
  priority: string,
  recipientName: string
): string {
  const priorityLabel = getPriorityLabel(priority);
  const priorityColor = getPriorityColor(priority);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 4px solid #000000; box-shadow: 8px 8px 0px #000000;">
          <!-- Header -->
          <tr>
            <td style="background-color: #FFE135; padding: 24px; border-bottom: 4px solid #000000;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 32px;">🏫</span>
                    <span style="font-size: 20px; font-weight: 800; margin-left: 12px; color: #1A1A2E;">박달초등학교</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Priority Badge -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <span style="display: inline-block; padding: 8px 16px; background-color: ${priorityColor}; color: #ffffff; font-weight: 800; font-size: 14px; border: 3px solid #000000; border-radius: 4px;">
                ${priorityLabel}
              </span>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td style="padding: 16px 24px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #1A1A2E;">
                ${title}
              </h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 24px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #666666;">
                ${recipientName}님, 안녕하세요.
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <div style="background-color: #f9f9f9; border: 3px solid #000000; padding: 20px; border-radius: 8px;">
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333; white-space: pre-wrap;">
${content}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 32px 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}/dashboard" 
                 style="display: inline-block; padding: 16px 32px; background-color: #FFE135; color: #1A1A2E; font-weight: 800; font-size: 16px; text-decoration: none; border: 4px solid #000000; box-shadow: 4px 4px 0px #000000;">
                포털에서 확인하기 →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1A2E; padding: 24px; border-top: 4px solid #000000;">
              <p style="margin: 0; font-size: 14px; color: #ffffff; text-align: center;">
                © 2026 박달초등학교 교직원 포털
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #888888; text-align: center;">
                이 메일은 박달초등학교 교직원 포털에서 발송되었습니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();
    const { type, title, content, priority = 'normal', recipients } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided' },
        { status: 400 }
      );
    }

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return NextResponse.json({
        success: true,
        message: 'Email service not configured',
        sent: 0,
      });
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const html = generateEmailHtml(title, content, priority, recipient.displayName);
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `박달초등학교 <${FROM_EMAIL}>`,
            to: recipient.email,
            subject: `[박달초등학교] ${getPriorityLabel(priority)} ${title}`,
            html,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send email');
        }

        return await response.json();
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successful} emails, ${failed} failed`,
      sent: successful,
      failed,
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
