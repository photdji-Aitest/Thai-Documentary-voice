import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  FileText, 
  Check, 
  Settings, 
  Film, 
  Clock, 
  Sliders,
  Radio,
  BookOpen,
  ChevronDown,
  Info
} from 'lucide-react';

interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  description: string;
}

const VOICES: VoiceOption[] = [
  { id: 'Bodi', name: 'Bodi (โอดิน / บอดี้)', gender: 'Male', description: 'เสียงทุ้ม นุ่มลึก ทรงพลัง เหมาะกับสารคดีประวัติศาสตร์และจักรวาล' },
  { id: 'Puck', name: 'Puck (พักก์)', gender: 'Male', description: 'เสียงนุ่ม ชัดเจน ให้ความรู้สึกเป็นกันเองแต่มีความน่าเชื่อถือ' },
  { id: 'Kore', name: 'Kore (โคเร)', gender: 'Female', description: 'เสียงนุ่มนวล สุขุม เหมาะกับสารคดีธรรมชาติและศิลปวัฒนธรรม' },
  { id: 'Charon', name: 'Charon (คารอน)', gender: 'Male', description: 'เสียงทุ้มต่ำ ลึกลับ น่าค้นหา เหมาะกับเรื่องราวลี้ลับและสืบสวน' },
  { id: 'Fenrir', name: 'Fenrir (เฟนริร์)', gender: 'Male', description: 'เสียงเข้ม แข็งแกร่ง ดุดัน เหมาะกับสารคดีสงครามและการเอาชีวิตรอด' },
  { id: 'Zephyr', name: 'Zephyr (เซฟายร์)', gender: 'Female', description: 'เสียงสดใส นุ่มนวล ชวนฝัน เหมาะกับสารคดีท่องเที่ยวและวิทยาศาสตร์' },
  { id: 'Aoede', name: 'Aoede (เอโอดิ)', gender: 'Female', description: 'เสียงไพเราะ มีพลังขับเน้นอารมณ์สูง' },
  { id: 'Orion', name: 'Orion (โอไรออน)', gender: 'Male', description: 'เสียงทุ้มกังวาน สไตล์ผู้ประกาศข่าวระดับโลก' }
];

const SAMPLE_SCRIPTS = [
  {
    title: 'ความลับใต้ท้องมหาสมุทรลึก (Deep Sea Abyss)',
    category: 'ธรรมชาติ & วิทยาศาสตร์',
    script: `ในความมืดมิดสนิทที่ความกดอากาศสูงนับพันเท่า ณ ก้นบึ้งของมหาสมุทรแปซิฟิก... เสียงกระซิบจากโลกยุคโบราณยังคงก้องกังวาน สิ่งมีชีวิตปริศนาที่ไร้ซึ่งดวงตา แต่กลับเรืองแสงสีฟ้าเรืองรองในความเวิ้งว้าง คือผู้ครอบครองอาณาจักรที่มนุษย์ยังไม่เคยสัมผัส... การเดินทางสู่ใจกลางความลึกลับกำลังจะเริ่มต้นขึ้น`
  },
  {
    title: 'อารยธรรมที่สาบสูญกลางป่าลึก (Lost Jungle Empire)',
    category: 'ประวัติศาสตร์โบราณ',
    script: `ท่ามกลางละอองหมอกหนาทึบและพุ่มไม้รกชัฏของผืนป่าอัมซอน ซากปรักหักพังของวิหารหินศิลาแลงอายุหลายพันปีตั้งตระหง่านท้าทายกาลเวลา ที่นี่... เคยเป็นศูนย์กลางของอาณาจักรที่เคยรุ่งเรืองถึงขีดสุด ก่อนจะหายสาบสูญไปอย่างไร้ร่องรอยในชั่วข้ามคืน... อะไรคือคำสาปที่นำพาความพินาศมาสู่พวกเขากันแน่?`
  },
  {
    title: 'การเดินทางสู่ขอบจักรวาล (Edge of the Cosmos)',
    category: 'ดาราศาสตร์ & อวกาศ',
    script: `ทุกๆ วินาทีที่แสงเดินทางผ่านห้วงอวกาศอันไร้ที่สิ้นสุด เรากำลังมองย้อนกลับไปในอดีต... หลุมดำขนาดยักษ์ใจกลางกาแล็กซี กำลังกลืนกินทุกสิ่งแม้กระทั่งแสงสว่างด้วยแรงโน้มถ่วงอันมหาศาล นี่คือเรื่องราวของจุดจบและจุดเริ่มต้นใหม่แห่งสรรพสิ่ง`
  }
];

const DEFAULT_STYLE = "Thai male voice, deep, authoritative, and mysterious tone, similar to a high-end world-class documentary narrator. Moderate speaking pace, clear articulation, with short, dramatic pauses after sentences to build suspense.";

interface HistoryItem {
  id: string;
  timestamp: string;
  script: string;
  voice: string;
  audioUrl: string;
  duration?: string;
}

export default function App() {
  const [script, setScript] = useState(SAMPLE_SCRIPTS[0].script);
  const [selectedVoice, setSelectedVoice] = useState('Bodi');
  const [styleInstructions, setStyleInstructions] = useState(DEFAULT_STYLE);
  const [showAdvancedStyle, setShowAdvancedStyle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current audio result
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Script Assist Modal / state
  const [isAssistOpen, setIsAssistOpen] = useState(false);
  const [assistTopic, setAssistTopic] = useState('');
  const [assistTone, setAssistTone] = useState('ลึกลับ น่าติดตาม ทรงพลัง');
  const [isAssisting, setIsAssisting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError('กรุณากรอกข้อความบทบรรยายสารคดี');
      return;
    }

    setIsGenerating(true);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script,
          voiceName: selectedVoice,
          styleInstructions: styleInstructions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างเสียง');
      }

      // data.audioBase64 is a complete WAV file from Gemini 3.8 Flash TTS
      const binaryString = atob(data.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        script: script.length > 60 ? script.substring(0, 60) + '...' : script,
        voice: selectedVoice,
        audioUrl: url,
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]);

    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('หนาแน่น')) {
        setError('ขณะนี้ระบบโมเดล AI กำลังประสบปัญหาการใช้งานหนาแน่นชั่วคราว (503 High Demand) คุณสามารถกดปุ่มทดลองฟังด้วยเสียงสำรองเบราว์เซอร์ด้านล่างได้ทันทีครับ');
      } else {
        setError(msg || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์เพื่อสร้างเสียงได้');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error('Playback error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScriptAssist = async () => {
    if (!assistTopic.trim()) return;
    setIsAssisting(true);
    try {
      const res = await fetch('/api/script-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: assistTopic, tone: assistTone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.script) {
        setScript(data.script);
        setIsAssistOpen(false);
      }
    } catch (e: any) {
      alert(e.message || 'เกิดข้อผิดพลาดในการสร้างสคริปต์');
    } finally {
      setIsAssisting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Film className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Thai Documentary Studio</h1>
              <p className="text-xs text-amber-400/90 font-medium">Gemini 3.8 Flash TTS Voiceover</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#generator" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">สตูดิโอพากย์เสียง</a>
            <a href="#templates" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">บทสารคดีตัวอย่าง</a>
            <a href="#history" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">ประวัติการสร้าง</a>
          </nav>

          {/* Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAssistOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-600/30 rounded-lg hover:bg-amber-900/40 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>ผู้ช่วยเขียนบท AI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8" id="generator">
        {/* Hero Info Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 border border-slate-800 p-8 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ขับเคลื่อนด้วย Gemini 3.8 Flash TTS ระดับโลก</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              สร้างเสียงบรรยายสารคดีภาษาไทย ระดับภาพยนตร์สารคดีระดับโลก
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              จำลองเสียงผู้บรรยายชายโทนเสียงทุ้มลึกลงตัว (Bodi) พร้อมจังหวะการเว้นวรรคอันทรงพลัง ดึงดูดผู้ชมให้ดำดิ่งสู่ห้วงอารมณ์ของสารคดีได้อย่างสมบูรณ์แบบ
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div id="templates" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>เลือกบทสารคดีตัวอย่างเพื่อทดลองทันที:</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_SCRIPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setScript(item.script)}
                className="text-left p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all group relative flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.script}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                  <span>โหลดสคริปต์นี้</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Studio Control & Script Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Script Editor & Voice Settings (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Script Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>สคริปต์บทบรรยายสารคดี (Thai Script)</span>
                </label>
                <button
                  onClick={() => setScript('')}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างข้อความ</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="พิมพ์หรือวางสคริปต์บทบรรยายสารคดีภาษาไทยของคุณที่นี่..."
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm leading-relaxed resize-y font-sans"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500 font-mono">
                  {script.length} ตัวอักษร
                </div>
              </div>

              {/* Voice and Style Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                {/* Voice Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>เลือกเสียงพากย์ (Voice Persona)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
                    >
                      {VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.gender})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {VOICES.find(v => v.id === selectedVoice)?.description}
                  </p>
                </div>

                {/* Style Mode Toggle */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      <span>สไตล์การบรรยาย (Style Instructions)</span>
                    </label>
                    <button
                      onClick={() => setShowAdvancedStyle(!showAdvancedStyle)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      {showAdvancedStyle ? 'ซ่อนการตั้งค่า' : 'ปรับแต่งสไตล์'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 italic">
                    "{styleInstructions.substring(0, 95)}..."
                  </div>
                </div>
              </div>

              {/* Advanced Style Editor */}
              {showAdvancedStyle && (
                <div className="space-y-2 pt-2 animate-fadeIn">
                  <label className="text-xs font-semibold text-amber-400">
                    แก้ไขคำสั่งควบคุมสไตล์เสียง (Voice Style Prompt):
                  </label>
                  <textarea
                    value={styleInstructions}
                    onChange={(e) => setStyleInstructions(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-amber-500/30 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <p className="text-[11px] text-slate-500">
                    * ค่าเริ่มต้นถูกล็อกไว้ให้ได้เสียงสารคดีทุ้มลึกและมีจังหวะหยุดพักอันทรงพลัง
                  </p>
                </div>
              )}

              {/* Error display */}
              {error && (
                <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-600/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-amber-200">
                    <Info className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{error}</span>
                  </div>
                  {error.includes('503') || error.includes('หนาแน่น') ? (
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(script);
                          utterance.lang = 'th-TH';
                          utterance.rate = playbackRate;
                          utterance.onstart = () => setIsPlaying(true);
                          utterance.onend = () => setIsPlaying(false);
                          window.speechSynthesis.speak(utterance);
                          setIsPlaying(true);
                        } else {
                          alert('เบราว์เซอร์นี้ไม่รองรับระบบเสียงพูด');
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>ทดลองฟังด้วยเสียงสำรองเบราว์เซอร์ทันที</span>
                    </button>
                  ) : null}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !script.trim()}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-900/30 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>กำลังประมวลผลเสียงบรรยายสารคดี (Gemini 3.8 Flash TTS)...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-slate-950" />
                    <span>สร้างเสียงบรรยายสารคดีทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Audio Player & Output Workspace */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>เครื่องเล่นเสียงบรรยาย (Audio Player)</span>
                </h3>
                {audioUrl && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    พร้อมใช้งาน (WAV)
                  </span>
                )}
              </div>

              {audioUrl ? (
                <div className="space-y-6">
                  {/* Hidden Audio Element */}
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                  />

                  {/* Waveform Visualization Mock / Playback Status */}
                  <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center px-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                      {[35, 60, 20, 80, 45, 90, 30, 70, 50, 85, 40, 95, 60, 30, 75, 45, 85, 55, 30, 70, 40, 80, 50, 90, 35].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-amber-500 rounded-full transition-all duration-150"
                          style={{
                            height: isPlaying ? `${Math.max(15, (h * Math.random() + 20))}px` : `${h * 0.4}px`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative z-10 text-center">
                      <div className="text-xs font-mono font-bold text-amber-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isPlaying ? 'กำลังเล่นเสียงบรรยาย...' : 'พร้อมเล่น'}
                      </div>
                    </div>
                  </div>

                  {/* Seek Bar */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {/* Speed Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">ความเร็วเสียง:</span>
                    <div className="flex gap-1.5">
                      {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-all ${
                            playbackRate === rate
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <a
                    href={audioUrl}
                    download={`documentary_voiceover_${selectedVoice}_${Date.now()}.wav`}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>ดาวน์โหลดไฟล์เสียง (.WAV)</span>
                  </a>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-300">ยังไม่มีเสียงบรรยาย</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      พิมพ์สคริปต์ของคุณแล้วกดปุ่ม "สร้างเสียงบรรยายทันที" เพื่อฟังตัวอย่าง
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div id="history" className="space-y-4 pt-6 border-t border-slate-800/80">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>ประวัติการสร้างเสียงในเซสชันนี้</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{item.timestamp}</span>
                      <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px]">เสียง: {item.voice}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      "{item.script}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setAudioUrl(item.audioUrl);
                        // Play it
                        setTimeout(() => {
                          if (audioRef.current) {
                            audioRef.current.play();
                            setIsPlaying(true);
                          }
                        }, 100);
                      }}
                      className="flex-1 py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>เล่นเสียงนี้</span>
                    </button>
                    <a
                      href={item.audioUrl}
                      download={`doc_voice_${item.voice}_${item.id}.wav`}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                      title="ดาวน์โหลด"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Script Assist Modal */}
      {isAssistOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ผู้ช่วยเขียนบทสารคดี AI (Gemini 4 Hydrogen)</span>
              </h3>
              <button
                onClick={() => setIsAssistOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">หัวข้อหรือประเด็นสารคดีที่คุณสนใจ:</label>
                <input
                  type="text"
                  value={assistTopic}
                  onChange={(e) => setAssistTopic(e.target.value)}
                  placeholder="เช่น การค้นพบเมืองโบราณใต้ทะเลเมดิเตอร์เรเนียน..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">โทนเสียงและบรรยากาศ:</label>
                <select
                  value={assistTone}
                  onChange={(e) => setAssistTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ลึกลับ น่าติดตาม ทรงพลัง">ลึกลับ น่าติดตาม ทรงพลัง (Mystery & Suspense)</option>
                  <option value="ประวัติศาสตร์ ยิ่งใหญ่ ขลัง">ประวัติศาสตร์ ยิ่งใหญ่ ขลัง (Epic & Historical)</option>
                  <option value="ธรรมชาติ ผ่อนคลาย น่าประทับใจ">ธรรมชาติ ผ่อนคลาย น่าประทับใจ (Nature & Wonder)</option>
                  <option value="วิทยาศาสตร์ อวกาศ ล้ำยุค">วิทยาศาสตร์ อวกาศ ล้ำยุค (Science & Cosmos)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsAssistOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleScriptAssist}
                disabled={isAssisting || !assistTopic.trim()}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isAssisting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังเขียนบท...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>สร้างสคริปต์ด้วย AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>Thai Documentary Voiceover Studio · Powered by Google Gemini 3.8 Flash TTS & Google AI Studio</p>
      </footer>
    </div>
  );
}
