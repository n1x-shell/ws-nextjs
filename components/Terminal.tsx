'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import PixiCRT from './PixiCRT';
import TabContent from './TabContent';
import useKonami from '@/hooks/useKonami';

type Tab = 'home' | 'synthetics' | 'analogues' | 'hybrids' | 'uplink';

export default function Terminal() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [uptime, setUptime] = useState(0);
  const [processorLoad, setProcessorLoad] = useState('█████░░░░░');
  const [shouldGlitch, setShouldGlitch] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const screenContentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const konamiActivated = useKonami();

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Processor load randomizer
  useEffect(() => {
    const loads = [
      '██████████',
      '█████████░',
      '████████░░',
      '███████░░░',
      '████████░░',
      '█████████░',
    ];
