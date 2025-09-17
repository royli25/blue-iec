import React from "react";

type OrbGraphicProps = {
  className?: string;
};

const OrbGraphic: React.FC<OrbGraphicProps> = ({ className }) => {
  const svgSize = 700;
  const centerX = svgSize / 2 + 22; // slight asymmetry
  const centerY = svgSize / 2 - 30; // slight asymmetry

  const ringRadii: number[] = [];
  for (let radius = 40; radius <= 320; radius += 18) {
    ringRadii.push(radius);
  }

  // lightweight deterministic pseudo-random for repeatable phases
  const seededRand = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const blobRadius = (base: number, angle: number, ringIndex: number) => {
    const p1 = seededRand(ringIndex + 1) * Math.PI * 2;
    const p2 = seededRand(ringIndex + 2) * Math.PI * 2;
    const p3 = seededRand(ringIndex + 3) * Math.PI * 2;
    const a1 = 0.28; // main wobble
    const a2 = 0.12; // secondary
    const a3 = 0.06; // fine detail

    // decay wobble on outer rings for softer edge
    const decay = 0.85 - (ringIndex / ringRadii.length) * 0.35;
    const r =
      base *
      (1 + a1 * Math.sin(3 * angle + p1) * decay + a2 * Math.sin(7 * angle + p2) + a3 * Math.sin(11 * angle + p3));
    return r;
  };

  const renderRings = () => {
    const elements: React.ReactNode[] = [];
    ringRadii.forEach((baseRadius, ringIndex) => {
      const dotsOnRing = Math.max(28, Math.round((baseRadius * Math.PI) / 8));
      for (let i = 0; i < dotsOnRing; i += 1) {
        const angle = (i / dotsOnRing) * Math.PI * 2;
        const radius = blobRadius(baseRadius, angle, ringIndex);
        // small positional jitter for organic feel
        const jitter = (seededRand(ringIndex * 1000 + i) - 0.5) * 2.2;
        const x = centerX + (radius + jitter) * Math.cos(angle);
        const y = centerY + (radius - jitter) * Math.sin(angle);
        const isEmphasis = i % Math.max(5, Math.floor(dotsOnRing / 16)) === 0;
        const dotRadius = isEmphasis ? 2.6 : 1.3;
        const opacity = 0.15 + (ringIndex / ringRadii.length) * 0.6;

        elements.push(
          <circle
            key={`dot-${ringIndex}-${i}`}
            cx={x}
            cy={y}
            r={dotRadius}
            fill="currentColor"
            opacity={opacity}
          />,
        );

        if (isEmphasis) {
          elements.push(
            <circle
              key={`halo-${ringIndex}-${i}`}
              cx={x}
              cy={y}
              r={dotRadius * 3.5}
              fill="none"
              stroke="currentColor"
              strokeOpacity={opacity * 0.3}
              strokeWidth={0.6}
            />,
          );
        }
      }
    });

    return elements;
  };

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width={svgSize}
      height={svgSize}
      className={className}
      aria-hidden
    >
      <g transform={`translate(0,0)`}>
        {renderRings()}
      </g>
    </svg>
  );
};

export default OrbGraphic;


