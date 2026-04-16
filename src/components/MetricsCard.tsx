import { TrendingUp, Eye, Heart, MessageCircle, Bookmark, Share2, Sparkles } from 'lucide-react';
import type { MetricsCardData } from '../types/spark';

interface MetricsCardProps {
  data: MetricsCardData;
}

const PLATFORM_LABELS: Record<string, string> = {
  all: '全平台汇总',
  xiaohongshu: '小红书',
  wechat: '微信公众号',
  douyin: '抖音',
  tiktok: 'TikTok',
  instagram: 'Instagram',
};

function formatNumber(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function MetricsCard({ data }: MetricsCardProps) {
  const { metrics } = data;
  const engagementRate =
    metrics.views > 0
      ? ((metrics.likes + metrics.comments + metrics.saves) / metrics.views) * 100
      : 0;
  const platformLabel = PLATFORM_LABELS[data.platform] || data.platform;
  const fetchedDate = new Date(data.fetchedAt);
  const fetchedLabel = fetchedDate.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const stats = [
    { icon: Eye, label: '浏览', value: metrics.views, color: 'text-blue-600' },
    { icon: Heart, label: '点赞', value: metrics.likes, color: 'text-red-500' },
    { icon: MessageCircle, label: '评论', value: metrics.comments, color: 'text-purple-500' },
    { icon: Bookmark, label: '收藏', value: metrics.saves, color: 'text-yellow-600' },
    { icon: Share2, label: '分享', value: metrics.shares, color: 'text-green-600' },
  ];

  return (
    <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/60 to-purple-50/40 overflow-hidden spark-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-100/40 border-b border-blue-200/50">
        <TrendingUp size={14} className="text-blue-700" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-blue-800 leading-tight truncate">
            📊 24h 数据回传 · {platformLabel}
          </div>
          <div className="text-[11px] text-blue-700/70 mt-0.5 truncate">
            「{data.title}」 · {fetchedLabel}
          </div>
        </div>
        {data.source === 'mock' && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">
            模拟
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div className="px-3 pt-3 pb-2 bg-white">
        <div className="grid grid-cols-5 gap-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-gray-50/70">
                <Icon size={14} className={s.color} />
                <div className="text-[14px] font-semibold text-[#333] mt-1 leading-tight">
                  {formatNumber(s.value)}
                </div>
                <div className="text-[10px] text-[#999] mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Engagement rate bar */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#666]">互动率</span>
            <span className={`font-semibold ${engagementRate > 8 ? 'text-green-600' : engagementRate > 4 ? 'text-blue-600' : 'text-gray-500'}`}>
              {engagementRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(engagementRate * 5, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI insight */}
      {data.aiInsight && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-spark-orange/5 to-purple-50/50 border-t border-blue-100">
          <div className="flex gap-1.5 items-start">
            <Sparkles size={12} className="text-spark-orange shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[10px] text-spark-orange font-medium mb-0.5">火花点评</div>
              <div className="text-[12px] text-[#444] leading-relaxed">{data.aiInsight}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
