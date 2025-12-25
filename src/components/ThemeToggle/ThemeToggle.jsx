"use client";
import styles from "./ThemeToggle.module.scss";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [light, setLight] = useState(false);
    // Load theme from localStorage on first render
    useEffect(() => {

        const saved = localStorage.getItem("yt_theme");
        if (saved) {
            document.documentElement.setAttribute("data-theme", saved);
            setLight(saved === "light");
        }
    }, [])

    // Update DOM + localStorage when theme changes
    useEffect(() => {
        const theme = light ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("yt_theme", theme);
    }, [light]);
    return (
        <>
            <label className={styles.toggle}>
                <input
                    type="checkbox"
                    checked={light}
                    onChange={(e) => setLight(e.target.checked)}
                />
                <span className={styles.slider}></span>
            </label>
        </>
    )
}