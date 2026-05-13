type Props = {
  value: number
}

export default function CompatibilityProgress({ value }: Props) {
  return <span>{Math.max(0, Math.min(100, Math.round(value)))}%</span>
}
