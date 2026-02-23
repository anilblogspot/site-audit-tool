'use client';

interface ScoreCardProps {
  title: string;
  score: number;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 50) return 'stroke-yellow-500';
  return 'stroke-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

export default function ScoreCard({
  title,
  score,
  icon,
  size = 'md',
}: ScoreCardProps) {
  const sizeConfig = {
    sm: {
      container: 'p-3',
      circle: 60,
      strokeWidth: 4,
      fontSize: 'text-lg',
      titleSize: 'text-sm',
    },
    md: {
      container: 'p-4',
      circle: 80,
      strokeWidth: 5,
      fontSize: 'text-2xl',
      titleSize: 'text-base',
    },
    lg: {
      container: 'p-6',
      circle: 120,
      strokeWidth: 6,
      fontSize: 'text-4xl',
      titleSize: 'text-lg',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.circle - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`${config.container} ${getScoreBgColor(score)} rounded-xl flex flex-col items-center`}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className={`font-semibold text-gray-800 ${config.titleSize}`}>
          {title}
        </h3>
      </div>

      {/* Circular Progress */}
      <div className="relative" style={{ width: config.circle, height: config.circle }}>
        <svg
          className="transform -rotate-90"
          width={config.circle}
          height={config.circle}
        >
          {/* Background circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            fill="none"
            className="stroke-gray-300"
          />
          {/* Progress circle */}
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            strokeWidth={config.strokeWidth}
            fill="none"
            className={`${getScoreRingColor(score)} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${config.fontSize} font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>

      {/* Label */}
      <p className={`mt-2 text-sm font-medium ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </p>
    </div>
  );
}
