/**
 * A weighted companion cube, drawn in a unit square centred on the origin
 * (-0.5 … 0.5, SVG orientation: y points down). Scale it with a transform.
 */
export function CompanionCube({ id = "cube" }: { id?: string }) {
  const corner = (rot: number) => (
    <g transform={`rotate(${rot})`}>
      {/* metal corner plate */}
      <path
        d="M -0.5 -0.5 H -0.17 Q -0.15 -0.5 -0.15 -0.47 V -0.4 Q -0.15 -0.37 -0.18 -0.37 H -0.34 Q -0.37 -0.37 -0.37 -0.34 V -0.18 Q -0.37 -0.15 -0.4 -0.15 H -0.47 Q -0.5 -0.15 -0.5 -0.17 Z"
        fill={`url(#${id}-metal)`}
        stroke="#3d464f"
        strokeWidth={0.012}
      />
      {/* pink indicator light on the plate */}
      <rect x={-0.455} y={-0.455} width={0.07} height={0.07} rx={0.015} fill="#f48fb1" opacity={0.9} />
      <circle cx={-0.26} cy={-0.43} r={0.015} fill="#2b3238" />
      <circle cx={-0.43} cy={-0.26} r={0.015} fill="#2b3238" />
    </g>
  )

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3e7ea" />
          <stop offset="1" stopColor="#a9b2b9" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9aa4ad" />
          <stop offset="1" stopColor="#5c6670" />
        </linearGradient>
        <radialGradient id={`${id}-disc`}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6dbdf" />
        </radialGradient>
      </defs>

      {/* body */}
      <rect x={-0.5} y={-0.5} width={1} height={1} rx={0.06} fill={`url(#${id}-body)`} stroke="#3d464f" strokeWidth={0.02} />

      {/* recessed cross channels */}
      <rect x={-0.1} y={-0.5} width={0.2} height={1} fill="#8d969e" opacity={0.55} />
      <rect x={-0.5} y={-0.1} width={1} height={0.2} fill="#8d969e" opacity={0.55} />
      <rect x={-0.025} y={-0.48} width={0.05} height={0.96} rx={0.02} fill="#f48fb1" opacity={0.75} />
      <rect x={-0.48} y={-0.025} width={0.96} height={0.05} rx={0.02} fill="#f48fb1" opacity={0.75} />

      {corner(0)}
      {corner(90)}
      {corner(180)}
      {corner(270)}

      {/* centre disc with heart */}
      <circle r={0.2} fill="#5c6670" />
      <circle r={0.165} fill={`url(#${id}-disc)`} stroke="#3d464f" strokeWidth={0.012} />
      <path
        d="M 0 0.095 C -0.17 -0.01 -0.1 -0.15 0 -0.06 C 0.1 -0.15 0.17 -0.01 0 0.095 Z"
        fill="#ec407a"
        stroke="#ad1457"
        strokeWidth={0.01}
      />
    </g>
  )
}
