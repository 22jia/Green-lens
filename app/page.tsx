'use client';

import { useState, useEffect, useRef } from 'react';
import { BrandESGData } from '@/lib/types';
import { Leaf, Users, Building2, AlertTriangle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

const POPULAR_BRANDS = ['Starbucks', 'Shein', 'Patagonia'];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<BrandESGData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // API 调用函数
  const analyzeBrand = async (brandName: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowSuggestions(false);
    setAnimatedScore(0);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: brandName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析失败，请稍后重试');
      }

      const data: BrandESGData = await response.json();
      
      // 【新增】调试日志：请打开浏览器控制台(F12)查看这里打印的内容
      // 检查 keyFacts 数组里是否有 sourceIndex 字段
      console.log("🔍 API 返回的完整数据:", data); 

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '分析失败，请稍后重试';
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索逻辑
  const handleSearch = async (brandName?: string) => {
    const nameToSearch = brandName || searchQuery.trim();
    if (nameToSearch && !isLoading) {
      await analyzeBrand(nameToSearch);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // 点击建议项
  const handleSuggestionClick = (brandName: string) => {
    setSearchQuery(brandName);
    handleSearch(brandName);
  };

  // 圆环进度条动画
  useEffect(() => {
    if (result && !isLoading) {
      setAnimatedScore(0);
      const targetScore = result.totalScore;
      const duration = 1500; // 1.5秒动画
      const steps = 60;
      const increment = targetScore / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newScore = Math.min(increment * currentStep, targetScore);
        setAnimatedScore(newScore);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedScore(targetScore);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [result, isLoading]);

  // 点击外部关闭建议面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-neon-green';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-500';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Slay':
        return 'text-neon-green';
      case 'Meh':
        return 'text-yellow-400';
      case 'Sus':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  // 计算圆环进度条的 stroke-dasharray
  const calculateCircumference = (radius: number) => {
    return 2 * Math.PI * radius;
  };

  const getProgressOffset = (score: number, radius: number) => {
    const circumference = calculateCircumference(radius);
    return circumference - (score / 100) * circumference;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-slate-950">
      <div className="z-10 max-w-5xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-4">
            Green Lens
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            ESG 消费透镜 - 打破信息壁垒
          </p>

          {/* Search Box with Suggestions */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="搜索品牌... (例如: Starbucks, Shein, Patagonia)"
                disabled={isLoading}
                className="w-full px-6 py-4 text-lg bg-slate-900 border-2 border-slate-700 rounded-lg 
                           text-slate-50 placeholder-slate-500 focus:outline-none focus:border-neon-green 
                           focus:ring-2 focus:ring-neon-green/50 transition-all
                           shadow-[0_0_20px_rgba(0,255,148,0.1)] focus:shadow-[0_0_30px_rgba(0,255,148,0.3)]
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-neon-green 
                           text-slate-950 font-semibold rounded-lg hover:bg-neon-green/90 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>分析中...</span>
                  </>
                ) : (
                  <span>搜索</span>
                )}
              </button>

              {/* Suggestions Dropdown */}
              {showSuggestions && !isLoading && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 
                             rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-xs text-slate-400 font-semibold">热门搜索</p>
                  </div>
                  <div className="py-1">
                    {POPULAR_BRANDS.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleSuggestionClick(brand)}
                        className="w-full px-4 py-3 text-left text-slate-200 hover:bg-slate-800 
                                   transition-colors flex items-center justify-between group"
                      >
                        <span>{brand}</span>
                        <span className="text-slate-500 group-hover:text-neon-green transition-colors">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 p-6 bg-slate-900/80 border border-slate-700 rounded-xl">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-neon-green animate-spin" />
                <div className="text-center">
                  <p className="text-xl font-semibold text-slate-50 mb-2">正在分析...</p>
                  <p className="text-slate-400">
                    正在搜索 &quot;{searchQuery}&quot; 的相关信息并进行 ESG 分析
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLoading && (
            <div className="mt-4 p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Result Card */}
        {result && !isLoading && (
          <div className="mt-12 p-6 md:p-8 bg-slate-900/80 border border-slate-700 rounded-xl 
                          shadow-2xl backdrop-blur-sm">
            {/* Header with Brand Name and Score */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold text-slate-50 mb-2">{result.name}</h2>
                <span className={`text-2xl font-semibold ${getRatingColor(result.rating)}`}>
                  {result.rating}
                </span>
              </div>

              {/* Circular Progress Ring with Animation */}
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90" width="128" height="128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={calculateCircumference(56)}
                    strokeDashoffset={getProgressOffset(animatedScore, 56)}
                    className={`${getScoreColor(result.totalScore)} transition-all duration-100`}
                    style={{
                      transition: 'stroke-dashoffset 0.1s ease-out',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(result.totalScore)}`}>
                      {Math.round(animatedScore)}
                    </div>
                    <div className="text-xs text-slate-400">总分</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Three Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Environment */}
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf className="w-6 h-6 text-neon-green" />
                  <h3 className="text-xl font-semibold text-slate-50">环境 (E)</h3>
                </div>
                <div className={`text-4xl font-bold mb-4 ${getScoreColor(result.dimensions.environment.score)}`}>
                  {result.dimensions.environment.score}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.dimensions.environment.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-neon-green" />
                  <h3 className="text-xl font-semibold text-slate-50">社会 (S)</h3>
                </div>
                <div className={`text-4xl font-bold mb-4 ${getScoreColor(result.dimensions.social.score)}`}>
                  {result.dimensions.social.score}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.dimensions.social.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Governance */}
              <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 text-neon-green" />
                  <h3 className="text-xl font-semibold text-slate-50">治理 (G)</h3>
                </div>
                <div className={`text-4xl font-bold mb-4 ${getScoreColor(result.dimensions.governance.score)}`}>
                  {result.dimensions.governance.score}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.dimensions.governance.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Facts - 更新版: 增加健壮性检查 */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-2xl font-semibold text-slate-50 mb-4">关键事实</h3>
              <div className="space-y-3">
                {result.keyFacts.map((fact: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      fact.type === 'positive'
                        ? 'bg-green-950/30 border-green-800/50 text-green-100'
                        : 'bg-red-950/30 border-red-800/50 text-red-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {fact.type === 'positive' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      
                      <p className="flex-1 text-sm md:text-base">
                        {fact.summary}
                        {/* 健壮性修改：同时检查 undefined 和 null */}
                        {(fact.sourceIndex !== undefined && fact.sourceIndex !== null) && 
                         result.sources && 
                         result.sources[fact.sourceIndex - 1] && (
                          <a
                            href={result.sources[fact.sourceIndex - 1].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-0.5 text-xs underline opacity-60 hover:opacity-100 transition-opacity"
                            title={result.sources[fact.sourceIndex - 1].title}
                          >
                            <span>[来源 {fact.sourceIndex}]</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}