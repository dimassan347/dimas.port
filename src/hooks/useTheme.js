import { useEffect } from 'react';
import { supabase } from '../supabase';
import { DEFAULT_THEME } from '../utils/themeManager';

const CSS_VAR_MAP = {
    // Primary and Secondary
    primary_color_dark: '--color-primary-dark',
    primary_color_light: '--color-primary-light',
    secondary_color_dark: '--color-secondary-dark',
    secondary_color_light: '--color-secondary-light',

    // Backdrop
    backdrop_base: '--color-backdrop-base',
    backdrop_glow: '--color-backdrop-glow',

    // Background
    background_blob_one: '--color-background-blob-one',
    background_blob_two: '--color-background-blob-two',
    background_blob_three: '--color-background-blob-three',
    background_blob_four: '--color-background-blob-four',
    background_grid_line: '--color-grid-line',
    background_grid_line_soft: '--color-grid-line-soft',
    background_gradient_from: '--color-background-gradient-from',
    background_gradient_to: '--color-background-gradient-to',

    // Text
    text_primary: '--color-text-primary',
    text_secondary: '--color-text-secondary',
    text_muted: '--color-text-muted',

    // Border
    border_light: '--color-border-light',
    border_dark: '--color-border-dark',

    // Buttons
    button_primary_from: '--color-button-primary-from',
    button_primary_to: '--color-button-primary-to',
    button_secondary_from: '--color-button-secondary-from',
    button_secondary_to: '--color-button-secondary-to',
    button_outline_color: '--color-button-outline',

    // Cards
    card_bg_light: '--color-card-bg-light',
    card_bg_dark: '--color-card-bg-dark',
    card_border_light: '--color-card-border-light',
    card_border_dark: '--color-card-border-dark',

    // States
    state_success: '--color-state-success',
    state_warning: '--color-state-warning',
    state_error: '--color-state-error',
    state_info: '--color-state-info',

    // Navigation
    navbar_bg: '--color-navbar-bg',
    navbar_link_active: '--color-navbar-link-active',
    navbar_link_inactive: '--color-navbar-link-inactive',

    // Forms & Links
    input_bg_color: '--color-input-bg',
    input_border_color: '--color-input-border',
    input_border_focus: '--color-input-border-focus',
    link_color: '--color-link',
    link_hover_color: '--color-link-hover',

    // Effects
    shadow_primary_color: '--color-shadow-primary',
    glow_color_primary: '--color-glow-primary',
    glow_color_secondary: '--color-glow-secondary',
    grid_line_color: '--color-grid-line',
    overlay_bg_color: '--color-overlay-bg',
};

const hexToRgba = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const hexToRgbTriplet = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
};

const injectCSSVariables = (colors) => {
    const root = document.documentElement;

    // Inject color variables
    Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
        const value = colors[key] || DEFAULT_THEME[key];
        root.style.setProperty(cssVar, value);
    });

    // Inject RGB variants for color-mix
    if (colors.backdrop_base) {
        root.style.setProperty(
            '--color-backdrop-base-rgb',
            hexToRgbTriplet(colors.backdrop_base)
        );
    }

    if (colors.backdrop_glow) {
        root.style.setProperty(
            '--color-backdrop-glow-rgb',
            hexToRgbTriplet(colors.backdrop_glow)
        );
    }

    if (colors.primary_color_dark) {
        root.style.setProperty(
            '--color-primary-dark-rgb',
            hexToRgbTriplet(colors.primary_color_dark)
        );
    }

    if (colors.primary_color_light) {
        root.style.setProperty(
            '--color-primary-light-rgb',
            hexToRgbTriplet(colors.primary_color_light)
        );
    }

    // Inject grid line variants with proper opacity
    const gridBase = colors.background_grid_line || colors.primary_color_dark;
    const gridSoft = colors.background_grid_line_soft || colors.primary_color_dark;

    root.style.setProperty('--color-grid-line', hexToRgba(gridBase, 0.035));
    root.style.setProperty('--color-grid-line-soft', hexToRgba(gridSoft, 0.018));
};

export const useTheme = () => {
    useEffect(() => {
        const setupTheme = async () => {
            try {
                // Check localStorage cache
                const cached = localStorage.getItem('theme_colors');
                if (cached) {
                    const colors = JSON.parse(cached);
                    injectCSSVariables(colors);
                }

                // Fetch from Supabase
                const { data, error } = await supabase
                    .from('site_theme')
                    .select('*')
                    .eq('id', 1)
                    .maybeSingle();

                if (error) throw error;

                if (data) {
                    // Extract color values - using all fields from CSS_VAR_MAP
                    const colors = {};
                    Object.keys(CSS_VAR_MAP).forEach(key => {
                        colors[key] = data[key] || DEFAULT_THEME[key];
                    });

                    console.log('[Theme] Initial theme loaded from database:', colors);
                    injectCSSVariables(colors);
                    localStorage.setItem('theme_colors', JSON.stringify(colors));
                }

                // Subscribe to real-time updates
                console.log('[Theme] Setting up realtime subscription...');
                const subscription = supabase
                    .channel('site_theme_changes')
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'site_theme',
                            filter: 'id=eq.1',
                        },
                        (payload) => {
                            console.log('[Theme] Realtime update received:', payload);
                            if (payload.new) {
                                const colors = {};
                                Object.keys(CSS_VAR_MAP).forEach(key => {
                                    colors[key] = payload.new[key] || DEFAULT_THEME[key];
                                });
                                console.log('[Theme] Injecting updated CSS variables:', colors);
                                injectCSSVariables(colors);
                                localStorage.setItem('theme_colors', JSON.stringify(colors));
                            }
                        }
                    )
                    .subscribe((status) => {
                        console.log('[Theme] Subscription status:', status);
                    });

                return () => {
                    console.log('[Theme] Cleaning up subscription');
                    supabase.removeChannel(subscription);
                };
            } catch (error) {
                console.error('Error setting up theme:', error);
            }
        };

        setupTheme();
    }, []);
};
