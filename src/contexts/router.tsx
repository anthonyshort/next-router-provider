import { NextRouter } from 'next/router';
import { createContext } from 'react';

export const RouterContext = createContext<NextRouter | null>(null);
