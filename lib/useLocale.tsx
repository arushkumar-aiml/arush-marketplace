"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../messages/en.json";
import { LANGUAGES } from "./data/languages";

export type LocaleCode = (typeof LANGUAGES)[number]["code"];

interface LocaleContextValue {
    locale: LocaleCode;
    setLocale: (locale: LocaleCode) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
    locale: "en",
    setLocale: () => { },
});

const STORAGE_KEY = "arush-locale";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = any;

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<LocaleCode>("en");
    const [messages, setMessages] = useState<Messages>(enMessages);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
        if (stored && LANGUAGES.some((l) => l.code === stored)) {
            loadLocale(stored);
        } else {
            setHydrated(true);
        }
    }, []);

    async function loadLocale(newLocale: LocaleCode) {
        if (newLocale === "en") {
            setMessages(enMessages);
            setLocaleState("en");
            setHydrated(true);
            return;
        }
        try {
            const loaded = await import(`../messages/${newLocale}.json`);
            setMessages(loaded.default ?? loaded);
            setLocaleState(newLocale);
        } catch (err) {
            console.error(`Couldn't load locale "${newLocale}", falling back to English.`, err);
            setMessages(enMessages);
            setLocaleState("en");
        } finally {
            setHydrated(true);
        }
    }

    function setLocale(newLocale: LocaleCode) {
        localStorage.setItem(STORAGE_KEY, newLocale);
        loadLocale(newLocale);
    }

    if (!hydrated) {
        return null;
    }

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
                {children}
            </NextIntlClientProvider>
        </LocaleContext.Provider>
    );
}

export function useLocale(): LocaleContextValue {
    return useContext(LocaleContext);
}