
import React from 'react';
import { Product } from './types';

export const FREE_TIER_GENERATIONS = 3;
export const PRO_TIER_GENERATIONS = 999;

export const ERROR_MESSAGES = {
  GENERATION_LIMIT: "Database limit reached. Initialize Access Engine to keep going!",
  GENERATION_FAILED: "The Access Engine is recalibrating. Try again in a few seconds.",
  REFINEMENT_FAILED: "Refinement failed. Pattern complexity exceeded.",
  RATE_LIMIT: "Too many requests. The Engine needs a moment to cool down.",
  AUTH_FAILED: "Authentication failed. Please verify your credentials.",
};

export const ICONS = {
  Lightbulb: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
  ),
  Engine: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 3.8 2.8 2.9"/><path d="M18 12h4"/><path d="m19.1 16.2 2.9 2.8"/><path d="M12 18v4"/><path d="m4.9 19.1 2.8 2.9"/><path d="M2 12h4"/><path d="m3.8 4.9 2.9 2.8"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Rocket: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"/><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"/></svg>
  ),
  Shield: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
  ),
  Crown: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>
  ),
  Lock: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  Layers: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polygon points="2 17 12 22 22 17"/><polygon points="2 12 12 17 22 12"/></svg>
  ),
  Sparkles: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
  ),
  Check: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ArrowRight: () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  )
};

export const MOODS = ['Productive Flow', 'Disruptive Tech', 'Mindful Minimal', 'Social Hype', 'Automated Ghost', 'Community Driven', 'Educational Lab'];

export const PRODUCTS: Product[] = [
  {
    id: 'basic-kit',
    name: 'Standard Pass',
    description: 'Get started with a few winning ideas.',
    price: 10,
    features: ['5 Blueprint Extractions', 'Viral Hook Logic', 'Tech Stack Guide']
  },
  {
    id: 'pro-engine',
    name: '1.5M Idea Access',
    description: 'Full unlimited access to our secret database.',
    price: 29,
    popular: true,
    features: ['Unlimited Extractions', 'Full 1.5M+ Database', 'Viral Vibe-Coding Mode', 'Priority VIP Support']
  },
  {
    id: 'enterprise-suite',
    name: 'CEO Master Suite',
    description: 'Direct consultation and custom architecture.',
    price: 99,
    features: ['Custom AI Prompt Engineering', 'Direct Strategy Session', 'Full Business Model Audit', 'Direct Email Access']
  }
];

export const SLOGANS = [
  "Build what's already winning.",
  "1.5M+ App Ideas for Success.",
  "Consulting Engine Initialized.",
  "Turn Vibe into Value.",
  "The Solo Founder's Shortcut.",
  "App Ideas for Real Money.",
  "Code Less, Earn More.",
  "1.5 Million Patterns. 1 Click."
];

export const PAYPAL_BASE_URL = "https://www.paypal.com/paypalme/catalinsparios";
export const SUPPORT_EMAIL = "support@idealab.ai";
export const VERIFICATION_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRMO02Fh7D1UZnfVDiLDqdkGNHB61OR1CPJs7nF5WZ78FrOm0pFg85ivEw3hsSv1fxhULG9Yvr8q0qS/pub?output=csv";
