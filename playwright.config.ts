import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:120000,workers:1,use:{baseURL:process.env.GAME_URL || 'http://127.0.0.1:5174/game/',channel:'chrome',headless:true},reporter:'list'});

