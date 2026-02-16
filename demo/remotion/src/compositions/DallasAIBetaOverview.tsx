import {Check, Database, Lock, Monitor, Shield, Smartphone, Users, Zap} from '@geist-ui/icons';
import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';
import {fadeIn, scaleIn, slideRight, slideUp} from '../utils/animations';

const DARK_BACKGROUND = '#0a0a0a';
const PANEL_BACKGROUND = 'rgba(23, 23, 23, 0.9)';
const BORDER_COLOR = 'rgba(115, 115, 115, 0.35)';
const PRIMARY_BLUE = '#0070F3';
const SUCCESS_GREEN = '#46A758';
const WARNING_AMBER = '#FFB224';

const INTRO_DURATION = 72;
const LANDING_DURATION = 96;
const SIGNUP_DURATION = 120;
const ROOM_DURATION = 120;
const ADMIN_DURATION = 96;
const OUTRO_DURATION = 72;

export const OVERVIEW_COMPOSITION_DEFAULTS = {
  durationInFrames:
    INTRO_DURATION + LANDING_DURATION + SIGNUP_DURATION + ROOM_DURATION + ADMIN_DURATION + OUTRO_DURATION,
  fps: 24,
  width: 1920,
  height: 1080
};

type IconType = React.ComponentType<{size?: number; color?: string}>;

type Highlight = {
  Icon: IconType;
  label: string;
  color: string;
};

type ShotSceneProps = {
  eyebrow: string;
  title: string;
  body: string;
  desktopImage: string;
  mobileImage?: string;
  highlights: Highlight[];
  panDistance?: number;
};

const timeline = {
  intro: 0,
  landing: INTRO_DURATION,
  signup: INTRO_DURATION + LANDING_DURATION,
  room: INTRO_DURATION + LANDING_DURATION + SIGNUP_DURATION,
  admin: INTRO_DURATION + LANDING_DURATION + SIGNUP_DURATION + ROOM_DURATION,
  outro: INTRO_DURATION + LANDING_DURATION + SIGNUP_DURATION + ROOM_DURATION + ADMIN_DURATION
};

const backgroundStyle: React.CSSProperties = {
  background:
    'radial-gradient(circle at 14% 12%, rgba(0, 112, 243, 0.25) 0%, rgba(10, 10, 10, 1) 45%, rgba(0, 0, 0, 1) 100%)'
};

const frameStyle: React.CSSProperties = {
  borderRadius: 24,
  border: `1px solid ${BORDER_COLOR}`,
  background: PANEL_BACKGROUND,
  boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden'
};

const chipStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 999,
  border: `1px solid ${color}66`,
  background: `${color}22`,
  color,
  fontSize: 16,
  fontWeight: 600,
  padding: '8px 14px'
});

const Header = ({projectName}: {projectName: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const opacity = fadeIn(frame, fps, 0, 0.45);

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 28
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 12, color: '#ededed'}}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            border: `1px solid ${BORDER_COLOR}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 112, 243, 0.15)'
          }}
        >
          <Zap size={16} color={PRIMARY_BLUE} />
        </div>
        <span style={{fontSize: 22, fontWeight: 650, letterSpacing: '-0.02em'}}>{projectName}</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, color: '#a3a3a3', fontSize: 16}}>
        <Database size={16} color="#737373" />
        Neon-backed live build
      </div>
    </div>
  );
};

const IntroScene = ({projectName}: {projectName: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const titleOpacity = fadeIn(frame, fps, 0.1, 0.5);
  const titleY = slideUp(frame, fps, 0.1, 42);
  const subtitleOpacity = fadeIn(frame, fps, 0.45, 0.45);
  const listOpacity = fadeIn(frame, fps, 0.8, 0.4);

  return (
    <AbsoluteFill style={backgroundStyle}>
      <AbsoluteFill style={{padding: '72px 84px'}}>
        <Header projectName={projectName} />
        <div style={{...frameStyle, flex: 1, padding: '76px 86px', display: 'flex', flexDirection: 'column'}}>
          <div style={{fontSize: 20, color: PRIMARY_BLUE, fontWeight: 600, letterSpacing: '0.18em'}}>DALLAS AI DIRECT</div>
          <h1
            className="video-heading"
            style={{
              margin: '16px 0 0 0',
              fontSize: 92,
              lineHeight: 0.98,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`
            }}
          >
            Overview Walkthrough
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 980,
              fontSize: 34,
              lineHeight: 1.24,
              color: '#d4d4d4',
              opacity: subtitleOpacity
            }}
          >
            A shareable tour of the current beta: landing, signup, directory, matchmaking, and admin operations.
          </p>

          <div style={{marginTop: 36, display: 'flex', gap: 18, opacity: listOpacity}}>
            <div style={chipStyle(PRIMARY_BLUE)}>
              <Users size={16} color={PRIMARY_BLUE} />
              Community onboarding
            </div>
            <div style={chipStyle(SUCCESS_GREEN)}>
              <Shield size={16} color={SUCCESS_GREEN} />
              Privacy-safe by design
            </div>
            <div style={chipStyle(WARNING_AMBER)}>
              <Lock size={16} color={WARNING_AMBER} />
              Auth-gated operations
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ShotScene = ({eyebrow, title, body, desktopImage, mobileImage, highlights, panDistance = -48}: ShotSceneProps) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const titleOpacity = fadeIn(frame, fps, 0.05, 0.35);
  const titleY = slideUp(frame, fps, 0.05, 28);
  const shotOpacity = fadeIn(frame, fps, 0.2, 0.4);
  const shotScale = scaleIn(frame, fps, 0.2, 0.96);
  const mobileScale = scaleIn(frame, fps, 0.42, 0.84);
  const desktopPan = interpolate(frame, [0, durationInFrames - 1], [0, panDistance], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill style={backgroundStyle}>
      <AbsoluteFill style={{padding: '72px 84px'}}>
        <div
          style={{
            ...frameStyle,
            flex: 1,
            padding: '54px 56px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{fontSize: 18, color: PRIMARY_BLUE, fontWeight: 600, letterSpacing: '0.16em'}}>{eyebrow}</div>
          <h2
            className="video-heading"
            style={{
              margin: '12px 0 0 0',
              fontSize: 66,
              lineHeight: 1.02,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`
            }}
          >
            {title}
          </h2>
          <p style={{marginTop: 14, fontSize: 30, lineHeight: 1.24, color: '#c7c7c7', maxWidth: 1060, opacity: titleOpacity}}>
            {body}
          </p>

          <div style={{display: 'flex', gap: 12, marginTop: 20, opacity: titleOpacity}}>
            {highlights.map((highlight) => {
              const Icon = highlight.Icon;
              return (
                <div key={highlight.label} style={chipStyle(highlight.color)}>
                  <Icon size={15} color={highlight.color} />
                  {highlight.label}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 28,
              position: 'relative',
              flex: 1,
              opacity: shotOpacity,
              transform: `scale(${shotScale})`,
              transformOrigin: 'center center'
            }}
          >
            <div style={{...frameStyle, height: '100%', borderRadius: 20, background: DARK_BACKGROUND}}>
              <div
                style={{
                  height: 46,
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 14px'
                }}
              >
                <span style={{width: 10, height: 10, borderRadius: 999, background: '#ef4444'}} />
                <span style={{width: 10, height: 10, borderRadius: 999, background: '#f59e0b'}} />
                <span style={{width: 10, height: 10, borderRadius: 999, background: '#22c55e'}} />
                <span style={{marginLeft: 12, color: '#a3a3a3', fontSize: 14, fontFamily: 'Geist Mono'}}>{desktopImage}</span>
              </div>

              <div style={{position: 'absolute', inset: '46px 0 0 0', overflow: 'hidden'}}>
                <Img
                  src={staticFile(desktopImage)}
                  style={{
                    width: '100%',
                    height: 'auto',
                    transform: `translateY(${desktopPan}px)`
                  }}
                />
              </div>
            </div>

            {mobileImage ? (
              <div
                style={{
                  position: 'absolute',
                  right: 28,
                  bottom: 20,
                  width: 220,
                  borderRadius: 28,
                  border: `1px solid ${BORDER_COLOR}`,
                  background: '#050505',
                  boxShadow: '0 18px 36px rgba(0, 0, 0, 0.45)',
                  overflow: 'hidden',
                  transform: `scale(${mobileScale})`
                }}
              >
                <Img src={staticFile(mobileImage)} style={{width: '100%', display: 'block'}} />
              </div>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const OutroScene = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const headlineOpacity = fadeIn(frame, fps, 0.05, 0.4);
  const headlineScale = scaleIn(frame, fps, 0.05, 0.94);

  const checklist = [
    {text: 'Live v0-style UX across landing, signup, room, and admin', color: PRIMARY_BLUE},
    {text: 'Community matchmaking via “You Should Meet...”', color: SUCCESS_GREEN},
    {text: 'Neon-backed reliability with auth-gated beta posture', color: WARNING_AMBER}
  ];

  return (
    <AbsoluteFill style={backgroundStyle}>
      <AbsoluteFill style={{padding: '80px 92px', justifyContent: 'center'}}>
        <div style={{...frameStyle, padding: '74px 84px'}}>
          <h2
            className="video-heading"
            style={{
              margin: 0,
              fontSize: 78,
              lineHeight: 1,
              opacity: headlineOpacity,
              transform: `scale(${headlineScale})`
            }}
          >
            Dallas AI Direct Beta
          </h2>
          <p style={{fontSize: 30, lineHeight: 1.3, color: '#c7c7c7', marginTop: 20, marginBottom: 26}}>
            Ready for demos, organizer onboarding, and handoff reviews.
          </p>

          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            {checklist.map((item, index) => {
              const opacity = fadeIn(frame, fps, 0.3 + index * 0.16, 0.35);
              const x = slideRight(frame, fps, 0.3 + index * 0.16, 20);
              return (
                <div
                  key={item.text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    opacity,
                    transform: `translateX(${x}px)`
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `1px solid ${item.color}88`,
                      background: `${item.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={16} color={item.color} />
                  </div>
                  <div style={{fontSize: 24, color: '#ededed'}}>{item.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type VideoProps = {
  projectName: string;
};

export const DallasAIBetaOverview = ({projectName}: VideoProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const vignetteOpacity = interpolate(
    spring({
      frame,
      fps,
      config: {damping: 160}
    }),
    [0, 1],
    [0.5, 1]
  );

  return (
    <AbsoluteFill style={{background: DARK_BACKGROUND}}>
      <AbsoluteFill style={{opacity: vignetteOpacity}}>
        <Sequence from={timeline.intro} durationInFrames={INTRO_DURATION}>
          <IntroScene projectName={projectName} />
        </Sequence>

        <Sequence from={timeline.landing} durationInFrames={LANDING_DURATION}>
          <ShotScene
            eyebrow="SCENE 01"
            title="Landing and event positioning"
            body="The hero clarifies the value proposition instantly and routes people into signup or live directory browsing."
            desktopImage="live/home-desktop.png"
            mobileImage="live/home-mobile.png"
            highlights={[
              {Icon: Users, label: 'Community-first copy', color: PRIMARY_BLUE},
              {Icon: Shield, label: 'Trust messaging', color: SUCCESS_GREEN},
              {Icon: Monitor, label: 'Desktop + mobile parity', color: WARNING_AMBER}
            ]}
          />
        </Sequence>

        <Sequence from={timeline.signup} durationInFrames={SIGNUP_DURATION}>
          <ShotScene
            eyebrow="SCENE 02"
            title="Signal-rich signup flow"
            body="Attendees share comfort level, what they need, and what they can offer so matching works in real time during event operations."
            desktopImage="live/signup-desktop.png"
            mobileImage="live/signup-mobile.png"
            panDistance={-220}
            highlights={[
              {Icon: Check, label: 'Fast completion', color: PRIMARY_BLUE},
              {Icon: Lock, label: 'Privacy-protected fields', color: SUCCESS_GREEN},
              {Icon: Smartphone, label: 'Mobile-friendly form', color: WARNING_AMBER}
            ]}
          />
        </Sequence>

        <Sequence from={timeline.room} durationInFrames={ROOM_DURATION}>
          <ShotScene
            eyebrow="SCENE 03"
            title="Directory and You Should Meet"
            body="The live room view combines attendee cards, filters, and introductions so facilitators can drive meaningful connections quickly."
            desktopImage="live/room-desktop.png"
            mobileImage="live/room-mobile.png"
            highlights={[
              {Icon: Users, label: 'Attendee directory', color: PRIMARY_BLUE},
              {Icon: Zap, label: 'Suggested intros', color: SUCCESS_GREEN},
              {Icon: Shield, label: 'Public-safe projection', color: WARNING_AMBER}
            ]}
          />
        </Sequence>

        <Sequence from={timeline.admin} durationInFrames={ADMIN_DURATION}>
          <ShotScene
            eyebrow="SCENE 04"
            title="Admin authentication + operations"
            body="Admin tooling remains authenticated and auditable, supporting facilitator decisions while preserving attendee privacy boundaries."
            desktopImage="live/admin-desktop.png"
            mobileImage="live/login-mobile.png"
            highlights={[
              {Icon: Lock, label: 'Operational auth surface', color: PRIMARY_BLUE},
              {Icon: Database, label: 'Neon session + event state', color: SUCCESS_GREEN},
              {Icon: Shield, label: 'Moderation-safe workflow', color: WARNING_AMBER}
            ]}
          />
        </Sequence>

        <Sequence from={timeline.outro} durationInFrames={OUTRO_DURATION}>
          <OutroScene />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
