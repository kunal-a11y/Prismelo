import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="t" x1="8" y1="25" x2="50" y2="1" gradientUnits="userSpaceOnUse"><stop stop-color="#f1f1f1"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="tr" x1="52" y1="2" x2="94" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff"/><stop offset=".6" stop-color="#fbfbfb"/><stop offset="1" stop-color="#ececec"/></linearGradient><linearGradient id="f" x1="94" y1="24" x2="50" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#f0f0f0"/><stop offset=".45" stop-color="#dcdcdc"/><stop offset="1" stop-color="#bcbcbc"/></linearGradient><linearGradient id="s" x1="7" y1="74" x2="48" y2="98" gradientUnits="userSpaceOnUse"><stop stop-color="#585858"/><stop offset=".55" stop-color="#333333"/><stop offset="1" stop-color="#161616"/></linearGradient></defs><path d="M6 23 50 0 50 46Z" fill="url(#t)"/><path d="M50 0 94 23 50 46Z" fill="url(#tr)"/><path d="M50 46 94 23 94 73 50 100Z" fill="url(#f)"/><path d="M50 46 6 73 50 100Z" fill="url(#s)"/></svg>`;

const markSrc = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString("base64")}`;

export const runtime = "nodejs";
export const alt =
  "Prismelo Technology — engineering secure software, cloud infrastructure and intelligent systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const navLinks = ["Services", "Companies", "Founder", "Community", "Docs"];
const strip = [
  ["Penetration testing", "#ff7e9d"],
  ["Cybersecurity", "#3fd8e6"],
  ["Cloud & hosting", "#c3f24f"],
  ["Software & AI", "#8b7bff"],
];

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000000",
          color: "#ffffff",
          position: "relative",
          padding: "34px 40px 0",
          fontFamily: "sans-serif",
        }}
      >
        {/* ambient light behind the window */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -220,
            left: -120,
            width: 760,
            height: 520,
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(139,123,255,0.30), rgba(63,216,230,0.10), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -180,
            right: -140,
            width: 620,
            height: 460,
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(255,126,157,0.16), transparent 70%)",
          }}
        />

        {/* browser window */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: "#050505",
            border: "1px solid #262626",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* window chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              height: 54,
              padding: "0 18px",
              borderBottom: "1px solid #1c1c1c",
              background: "#080808",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#2e2e2e" }} />
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#2e2e2e" }} />
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#2e2e2e" }} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 30,
                padding: "0 14px",
                background: "#101010",
                border: "1px solid #202020",
                borderRadius: 8,
                fontSize: 15,
                color: "#a0a0a0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: "#c3f24f",
                }}
              />
              prismelo.tech
            </div>
          </div>

          {/* site header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 76,
              padding: "0 40px",
              borderBottom: "1px solid #1c1c1c",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={markSrc} width={30} height={30} alt="" />
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  fontSize: 19,
                  letterSpacing: 6,
                }}
              >
                PRISMELO
                <span style={{ color: "#6e6e6e", letterSpacing: 2.5, marginLeft: 8 }}>
                  TECHNOLOGY
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 15, color: "#a0a0a0" }}>
              {navLinks.map((link) => (
                <div key={link} style={{ display: "flex" }}>
                  {link}
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  padding: "9px 18px",
                  borderRadius: 99,
                  background: "#ffffff",
                  color: "#000000",
                  fontSize: 14,
                }}
              >
                Start a conversation
              </div>
            </div>
          </div>

          {/* hero */}
          <div
            style={{
              display: "flex",
              flex: 1,
              padding: "36px 40px 0",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: 99, background: "#8b7bff" }} />
                <div style={{ width: 7, height: 7, borderRadius: 99, background: "#3fd8e6" }} />
                <div style={{ width: 7, height: 7, borderRadius: 99, background: "#c3f24f" }} />
                <div
                  style={{
                    fontSize: 12.5,
                    letterSpacing: 3,
                    color: "#8a8a8a",
                    marginLeft: 4,
                  }}
                >
                  ENGINEERING &amp; SECURITY
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 20,
                  fontSize: 52,
                  lineHeight: 1.06,
                  letterSpacing: -2,
                }}
              >
                <span>Engineering the next</span>
                <span>layer of technology.</span>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 17,
                  lineHeight: 1.45,
                  color: "#a0a0a0",
                  maxWidth: 520,
                }}
              >
                Secure digital systems, software experiences and intelligent
                infrastructure.
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 48,
                    padding: "0 26px",
                    borderRadius: 99,
                    background: "#ffffff",
                    color: "#000000",
                    fontSize: 15,
                  }}
                >
                  Explore Our Services
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 48,
                    padding: "0 26px",
                    borderRadius: 99,
                    border: "1px solid #2c2c2c",
                    color: "#ffffff",
                    fontSize: 15,
                  }}
                >
                  Contact Us
                </div>
              </div>
            </div>

            {/* system panel, echoing the hero art */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                marginLeft: 8,
                border: "1px solid #232323",
                background: "#070707",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  position: "relative",
                  overflow: "hidden",
                  backgroundImage:
                    "linear-gradient(to right, #141414 1px, transparent 1px), linear-gradient(to bottom, #141414 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    left: 34,
                    top: 74,
                    width: 220,
                    height: 108,
                    border: "1px solid #3a3a3a",
                    borderRadius: 4,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    left: 70,
                    top: 104,
                    width: 190,
                    height: 92,
                    border: "1px solid #8b7bff",
                    borderRadius: 4,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(139,123,255,0.30), rgba(63,216,230,0.08))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    left: 106,
                    top: 134,
                    width: 158,
                    height: 74,
                    border: "1px solid #c3f24f",
                    borderRadius: 4,
                    backgroundImage:
                      "linear-gradient(135deg, rgba(195,242,79,0.18), rgba(255,126,157,0.08))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    right: 18,
                    top: 18,
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: "#c3f24f",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #232323",
                  padding: "9px 14px",
                  background: "#070707",
                  fontSize: 9.5,
                  letterSpacing: 1.2,
                  color: "#6e6e6e",
                }}
              >
                <div style={{ display: "flex" }}>SYSTEM / 001</div>
                <div style={{ display: "flex" }}>SOFTWARE · SECURITY · CLOUD · AI</div>
              </div>
            </div>
          </div>

          {/* service strip */}
          <div style={{ display: "flex", borderTop: "1px solid #1c1c1c" }}>
            {strip.map(([label, color]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                  padding: "16px 20px",
                  borderRight: "1px solid #1c1c1c",
                  fontSize: 14,
                  color: "#ffffff",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 99, background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* page footer line, cropped by the card edge like a real scroll */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 6px",
            fontSize: 13,
            letterSpacing: 2.5,
            color: "#5a5a5a",
          }}
        >
          <div style={{ display: "flex" }}>{site.url.replace("https://", "")}</div>
          <div style={{ display: "flex" }}>CYBERSECURITY · CLOUD · SOFTWARE · AI</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
