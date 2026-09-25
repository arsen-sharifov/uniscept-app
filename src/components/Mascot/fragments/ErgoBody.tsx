import { ERGO_ANTENNA, ERGO_HEAD, MASCOT_LIMB_WIDTH } from '../consts';

export const ErgoBody = () => (
  <>
    <path
      d={`M${ERGO_HEAD.cx} ${ERGO_HEAD.cy - ERGO_HEAD.r} V${ERGO_ANTENNA.tipY}`}
      fill="none"
      stroke="var(--text-muted)"
      strokeWidth={MASCOT_LIMB_WIDTH}
      strokeLinecap="round"
    />
    <circle cx={ERGO_HEAD.cx} cy={ERGO_ANTENNA.tipY} r={ERGO_ANTENNA.radius} fill="var(--accent-2)" />

    <circle {...ERGO_HEAD} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.4" />
  </>
);
