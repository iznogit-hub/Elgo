import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Row,
  Column,
} from "@react-email/components";

interface ContactTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const ContactTemplate = ({
  name,
  email,
  message,
}: ContactTemplateProps) => {
  const previewText = `Incoming Transmission from ${name}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Heading style={title}>INCOMING_TRANSMISSION</Heading>
            <Text style={subtitle}>
              SECURE_CHANNEL_ESTABLISHED // ENCRYPTED_PACKET
            </Text>
          </Section>

          {/* Details Section */}
          <Section style={details}>
            <Row>
              <Column style={labelColumn}>
                <Text style={label}>IDENTIFIER:</Text>
              </Column>
              <Column>
                <Text style={value}>{name}</Text>
              </Column>
            </Row>
            <Hr style={divider} />
            <Row>
              <Column style={labelColumn}>
                <Text style={label}>FREQUENCY:</Text>
              </Column>
              <Column>
                <Link href={`mailto:${email}`} style={link}>
                  {email}
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Message Payload */}
          <Section style={payloadSection}>
            <Text style={label}>PAYLOAD (MESSAGE):</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>TERMINAL_ID: T7SEN_PORTFOLIO_V2</Text>
            <Text style={footerText}>
              TIMESTAMP: {new Date().toISOString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// --- Styles ---
// Cyberpunk Palette: Black background, Neon Green/White text
const main = {
  backgroundColor: "#000000",
  fontFamily: '"Courier New", Courier, monospace',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #333",
  borderRadius: "4px",
  margin: "0 auto",
  maxWidth: "600px",
  boxShadow: "0 0 20px rgba(0, 255, 0, 0.1)",
};

const header = {
  backgroundColor: "#111",
  borderBottom: "1px solid #333",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const title = {
  color: "#00ff00",
  fontSize: "24px",
  letterSpacing: "2px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const subtitle = {
  color: "#666",
  fontSize: "10px",
  margin: "10px 0 0",
  textTransform: "uppercase" as const,
};

const details = {
  padding: "20px 40px",
};

const labelColumn = {
  width: "140px",
};

const label = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
};

const value = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
};

const link = {
  color: "#00ff00",
  textDecoration: "none",
  fontSize: "14px",
};

const divider = {
  borderColor: "#222",
  margin: "10px 0",
};

const payloadSection = {
  padding: "0 40px 30px",
};

const messageBox = {
  backgroundColor: "#000000",
  border: "1px dashed #333",
  padding: "20px",
  marginTop: "10px",
};

const messageText = {
  color: "#dddddd",
  fontSize: "14px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const footer = {
  backgroundColor: "#050505",
  borderTop: "1px solid #333",
  padding: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#444",
  fontSize: "10px",
  margin: "5px 0",
};

export default ContactTemplate;
