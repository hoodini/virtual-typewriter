# Virtual Typewriter

An immersive virtual typewriter web application that authentically simulates using a 1960s mechanical typewriter.

## Features

### Authentic Typing Experience
- **Mechanical Key Animation**: Round glass keys with chrome bezels that depress realistically
- **Typebar Animation**: Visible typebar mechanism swings up with each keystroke
- **Character Imperfections**: Subtle rotation, offset, and ink density variations per character
- **Carriage System**: Manual carriage return with animated movement

### Typebar Collision System
- When typing too fast, adjacent keys can "jam" - just like a real typewriter
- Educational tooltips explain the QWERTY layout history
- Press ESC or click to unjam

### Sound Design
- Multiple keystroke sound variations
- Distinct spacebar and carriage return sounds
- Margin bell warning at end of line
- Collision/jam sound effects
- All sounds preloaded for zero latency

### Ink Ribbon System
- Visual ribbon spools showing remaining ink
- Ink depletes over ~800 characters
- Characters progressively lighter as ink depletes
- Click ribbon to change and reset
- Black/red ink toggle

### Paper System
- Three paper textures: Standard, Coffee Stained, Yellowed
- Visible paper curl effect
- Export page as PNG image
- LocalStorage saves work-in-progress

### Customization
- Three housing colors: Forest Green, Burgundy, Matte Black
- Three paper types
- Adjustable ink density
- Toggle sound, margin bell, and jam simulation
- Settings accessible via ESC key

### View Modes
- **Full View** (1): Complete typewriter with keys and mechanism
- **Focus Mode** (2): Zoomed on paper only
- **Desk View** (3): Zoomed out showing more environment

### Session Statistics
- Characters and words typed
- Elapsed time
- Typing speed (WPM)
- Carriage returns count
- Jam statistics with key pair tracking

## Design

Based on detailed design system specifications:
- **Colors**: Aged Cream #F2E8C9, Matte Gunmetal #4B5052, Oxidized Brass #8A7C4F, Forest Green #2A4B3A, Burgundy Leather #6B1E2F
- **Typography**: Special Elite (Google Fonts) - authentic typewriter font
- **Atmosphere**: Warm desk lamp lighting, moody dark environment, brass accents

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Bun** runtime
- **Tailwind CSS 4** for styling
- **Web Audio API** for sounds
- **html2canvas** for export

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Usage

1. Click anywhere or press any key to initialize audio
2. Type on your physical keyboard - the typewriter responds
3. Press ENTER or click carriage lever for new line
4. Press 1, 2, 3 to switch view modes
5. Press ESC to open settings

### Keyboard Shortcuts
- **1**: Full typewriter view
- **2**: Focus (paper only) view
- **3**: Desk (zoomed out) view
- **ESC**: Open settings / Unjam typewriter
- **ENTER**: Carriage return
- **BACKSPACE**: Overstrike (typewriters can't delete!)

## Educational Features

The app teaches typewriter history through interaction:
- Backspace tooltip explains typewriters couldn't truly erase
- Jam modal explains why QWERTY was designed to separate common letter pairs
- Statistics compare user WPM to professional 1960s typists (60-80 WPM)

## Browser Support

Optimized for desktop browsers with physical keyboards:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

Mobile devices show a warning recommending physical keyboard use.

## License

MIT
