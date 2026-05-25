import { supabase } from '../supabase';

export const THEME_COLOR_CATEGORIES = {
    primary: {
        fields: ['primary_color_dark', 'primary_color_light'],
        label: 'Primary Colors',
        hint: 'Main brand colors - used for primary UI elements and accents',
    },
    secondary: {
        fields: ['secondary_color_dark', 'secondary_color_light'],
        label: 'Secondary Colors',
        hint: 'Secondary brand colors - used for secondary UI elements',
    },
    backdrop: {
        fields: ['backdrop_base', 'backdrop_glow'],
        label: 'Backdrop Colors',
        hint: 'Background and glow effects for the page backdrop',
    },
    background: {
        fields: [
            'background_blob_one',
            'background_blob_two',
            'background_blob_three',
            'background_blob_four',
            'background_grid_line',
            'background_gradient_from',
            'background_gradient_to',
        ],
        label: 'Background Elements',
        hint: 'Animated blobs and grid overlay colors',
    },
    buttons: {
        fields: [
            'button_primary_from',
            'button_primary_to',
            'button_secondary_from',
            'button_secondary_to',
            'button_outline_color',
        ],
        label: 'Button Colors',
        hint: 'Button gradient and outline colors for interactive elements',
    },
    cards: {
        fields: [
            'card_bg_light',
            'card_bg_dark',
            'card_border_light',
            'card_border_dark',
        ],
        label: 'Card & Box Colors',
        hint: 'Background and border colors for cards and containers',
    },
    text: {
        fields: ['text_primary', 'text_secondary', 'text_muted'],
        label: 'Text Colors',
        hint: 'Text colors for primary and secondary content',
    },
    border: {
        fields: ['border_light', 'border_dark'],
        label: 'Border Colors',
        hint: 'Border colors for light and dark contexts',
    },
    states: {
        fields: ['state_success', 'state_warning', 'state_error', 'state_info'],
        label: 'State Colors',
        hint: 'Colors for success, warning, error, and info states',
    },
    navigation: {
        fields: ['navbar_bg', 'navbar_link_active', 'navbar_link_inactive'],
        label: 'Navigation Colors',
        hint: 'Colors for navbar background and link states',
    },
    forms: {
        fields: [
            'input_bg_color',
            'input_border_color',
            'input_border_focus',
            'link_color',
            'link_hover_color',
        ],
        label: 'Form & Link Colors',
        hint: 'Colors for input fields, borders, and links',
    },
    effects: {
        fields: [
            'shadow_primary_color',
            'glow_color_primary',
            'glow_color_secondary',
            'grid_line_color',
            'overlay_bg_color',
        ],
        label: 'Effects & Shadows',
        hint: 'Colors for shadows, glows, and overlay effects',
    },
};

export const DEFAULT_THEME = {
    // Primary and Secondary Colors
    primary_color_dark: '#6366f1',
    primary_color_light: '#a855f7',
    secondary_color_dark: '#8b5cf6',
    secondary_color_light: '#c084fc',

    // Backdrop
    backdrop_base: '#030014',
    backdrop_glow: '#1b123d',

    // Background Elements
    background_blob_one: '#6366f1',
    background_blob_two: '#a855f7',
    background_blob_three: '#ec4899',
    background_blob_four: '#8b5cf6',
    background_grid_line: '#6366f1',
    background_gradient_from: '#6366f1',
    background_gradient_to: '#a855f7',

    // Text Colors
    text_primary: '#f5f3ff',
    text_secondary: '#d8d4e8',
    text_muted: '#64748b',

    // Borders
    border_light: '#e5e0ff',
    border_dark: '#3d394e',

    // Buttons
    button_primary_from: '#6366f1',
    button_primary_to: '#a855f7',
    button_secondary_from: '#a855f7',
    button_secondary_to: '#6366f1',
    button_outline_color: '#a855f7',

    // Cards
    card_bg_light: '#ffffff',
    card_bg_dark: '#1e1b4b',
    card_border_light: '#e5e0ff',
    card_border_dark: '#3d394e',

    // States
    state_success: '#10b981',
    state_warning: '#f59e0b',
    state_error: '#ef4444',
    state_info: '#3b82f6',

    // Navigation
    navbar_bg: '#030014',
    navbar_link_active: '#ffffff',
    navbar_link_inactive: '#e2d3fd',

    // Forms & Links
    input_bg_color: '#ffffff',
    input_border_color: '#e5e0ff',
    input_border_focus: '#6366f1',
    link_color: '#6366f1',
    link_hover_color: '#a855f7',

    // Effects
    shadow_primary_color: '#6366f1',
    glow_color_primary: '#6366f1',
    glow_color_secondary: '#a855f7',
    grid_line_color: '#6366f1',
    overlay_bg_color: '#030014',
};

export const fetchTheme = async () => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

        if (error) throw error;

        return data || DEFAULT_THEME;
    } catch (error) {
        console.error('Error fetching theme:', error);
        return DEFAULT_THEME;
    }
};

export const updateTheme = async (colors) => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .upsert({ id: 1, ...colors }, { onConflict: 'id' })
            .select()
            .maybeSingle();

        if (error) throw error;

        return data || { id: 1, ...colors };
    } catch (error) {
        console.error('Error updating theme:', error);
        throw error;
    }
};

export const resetTheme = async () => {
    try {
        const { data, error } = await supabase
            .from('site_theme')
            .upsert({ id: 1, ...DEFAULT_THEME }, { onConflict: 'id' })
            .select()
            .maybeSingle();

        if (error) throw error;

        return data || { id: 1, ...DEFAULT_THEME };
    } catch (error) {
        console.error('Error resetting theme:', error);
        throw error;
    }
};
