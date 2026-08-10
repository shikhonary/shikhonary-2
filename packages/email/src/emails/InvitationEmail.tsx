import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import * as React from "react"

interface InvitationEmailProps {
  tenantName: string
  inviterName?: string
  invitationLink: string
  recipientName?: string
  message?: string
}

export const InvitationEmail = ({
  tenantName,
  inviterName = "সুপার অ্যাডমিন",
  invitationLink,
  recipientName,
  message,
}: InvitationEmailProps) => {
  const previewText = `ইউপি-হাব সিস্টেমে ${tenantName}-এর পোর্টালে যুক্ত হওয়ার জন্য আপনাকে আমন্ত্রণ জানানো হয়েছে`

  return (
    <Html lang="bn">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>প্রশাসনিক দলে যোগদানের আমন্ত্রণ</Heading>
          
          <Text style={text}>
            প্রিয় {recipientName || "সম্মানিত কর্মকর্তা/সদস্য"},
          </Text>

          <Text style={text}>
            আপনাকে ইউপি-হাব (UP-Hub) ডিজিটাল সার্ভিস প্ল্যাটফর্মে <strong>{tenantName}</strong>-এর ব্যবস্থাপনা টিম ও প্রশাসনিক পোর্টালে যুক্ত হওয়ার জন্য আমন্ত্রণ জানানো হয়েছে।
          </Text>

          {message && (
            <Section style={messageBox}>
              <Text style={messageLabel}>প্রশাসকের বার্তা:</Text>
              <Text style={messageText}>&quot;{message}&quot;</Text>
            </Section>
          )}

          <Section style={btnContainer}>
            <Button style={button} href={invitationLink}>
              আমন্ত্রণ গ্রহণ করুন এবং পোর্টালে যুক্ত হন
            </Button>
          </Section>

          <Text style={subtext}>
            বাটনটি কাজ না করলে নিচের লিঙ্কটি ব্রাউজারে কপি করে পেস্ট করুন:
          </Text>
          <Text style={linkText}>{invitationLink}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            * এই আমন্ত্রণ লিঙ্কটি আগামী ৭ দিন পর্যন্ত কার্যকর থাকবে।<br />
            যদি আপনি এই আমন্ত্রণের প্রত্যাশা না করে থাকেন, তবে নির্দ্বিধায় এই বার্তাটি উপেক্ষা করতে পারেন।
          </Text>
          <Text style={subFooter}>
            ইউপি-হাব — ইউনিয়ন পরিষদ স্মার্ট গভর্নেন্স সার্ভিসেস
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f4f6f9",
  fontFamily:
    'Kalpurush, SolaimanLipi, "Segoe UI", Roboto, Arial, sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 24px",
  borderRadius: "16px",
  maxWidth: "580px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
}

const h1 = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "20px 0 24px 0",
}

const text = {
  color: "#334155",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "14px 0",
}

const subtext = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "20px 0 6px 0",
}

const messageBox = {
  backgroundColor: "#f0f9ff",
  borderLeft: "4px solid #0284c7",
  padding: "14px 18px",
  margin: "20px 0",
  borderRadius: "8px",
}

const messageLabel = {
  color: "#0369a1",
  fontSize: "12px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
}

const messageText = {
  color: "#0f172a",
  fontSize: "14px",
  fontStyle: "italic",
  lineHeight: "22px",
  margin: 0,
}

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0 24px 0",
}

const button = {
  backgroundColor: "#0284c7",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
}

const linkText = {
  color: "#0284c7",
  fontSize: "12px",
  wordBreak: "break-all" as const,
  backgroundColor: "#f8fafc",
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px border #e2e8f0",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "28px 0 20px 0",
}

const footer = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
}

const subFooter = {
  color: "#94a3b8",
  fontSize: "11px",
  textAlign: "center" as const,
  margin: "12px 0 0 0",
  fontWeight: "bold",
}
