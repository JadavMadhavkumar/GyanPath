const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageBreak, PageNumber
} = require('docx');
const fs = require('fs');

// ── Color palette from DESIGN.md ──────────────────────────────────────────
const C = {
  primary:       "24389c",
  primaryLight:  "3f51b5",
  secondary:     "8b5000",
  secContainer:  "ff9800",
  tertiary:      "004e33",
  tertiaryFixed: "6ffbbe",
  surface:       "f8f9ff",
  surfLow:       "eef1fb",
  surfHigh:      "dce9ff",
  surfLowest:    "ffffff",
  onSurface:     "0d1c2e",
  onSurfVar:     "454652",
  outline:       "c5c5d4",
  navy:          "1F4E79",
  white:         "FFFFFF",
  black:         "000000",
  gray:          "888888",
  darkBg:        "0d1117",
  darkCard:      "161b22",
};

// ── Borders ──────────────────────────────────────────────────────────────
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: C.outline };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = {
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
};
const leftAccent = {
  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
  left: { style: BorderStyle.SINGLE, size: 24, color: C.primary }
};
const cm = { top: 80, bottom: 80, left: 120, right: 120 };

// ── Helpers ───────────────────────────────────────────────────────────────
const sp = (bef=0, aft=0) => ({ spacing: { before: bef, after: aft } });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    ...sp(320, 120),
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: C.primary })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    ...sp(240, 80),
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: C.primary })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    ...sp(180, 60),
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: C.navy })]
  });
}
function h4(text) {
  return new Paragraph({
    ...sp(140, 40),
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: C.onSurface })]
  });
}
function body(text, opts={}) {
  return new Paragraph({
    ...sp(60, 60),
    children: [new TextRun({ text, font: "Arial", size: 20, color: C.onSurface, ...opts })]
  });
}
function bodySmall(text, color=C.onSurfVar) {
  return new Paragraph({
    ...sp(40, 40),
    children: [new TextRun({ text, font: "Arial", size: 18, color })]
  });
}
function spacer(lines=1) {
  return Array.from({ length: lines }, () => new Paragraph({ children: [new TextRun("")] }));
}
function bullet(text, bold_prefix=null) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    ...sp(40, 40),
    children: bold_prefix
      ? [new TextRun({ text: bold_prefix + " ", font: "Arial", size: 20, bold: true, color: C.primary }),
         new TextRun({ text, font: "Arial", size: 20, color: C.onSurface })]
      : [new TextRun({ text, font: "Arial", size: 20, color: C.onSurface })]
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    ...sp(40, 40),
    children: [new TextRun({ text, font: "Arial", size: 20, color: C.onSurface })]
  });
}

// ── Divider ───────────────────────────────────────────────────────────────
function divider(color=C.primary) {
  return new Paragraph({
    ...sp(120, 120),
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 1 } },
    children: [new TextRun("")]
  });
}

// ── Section banner ────────────────────────────────────────────────────────
function sectionBanner(text, bg, fg) {
  bg = bg || C.primary; fg = fg || C.white;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            borders: borders,
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            shading: { fill: bg, type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [new TextRun({ text: text, font: "Arial", size: 26, bold: true, color: fg })]
              })
            ]
          })
        ]
      })
    ]
  });
}

// ── Color swatch table ────────────────────────────────────────────────────
function colorTable(colors) {
  // colors = [{name, hex, role, usage}]
  const W = [1800, 1200, 2160, 4200];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: W,
    rows: [
      new TableRow({ children: [
        new TableCell({ width:{size:W[0],type:WidthType.DXA}, borders, margins:cm, shading:{fill:C.primary,type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:"Color",font:"Arial",size:18,bold:true,color:C.white})]})] }),
        new TableCell({ width:{size:W[1],type:WidthType.DXA}, borders, margins:cm, shading:{fill:C.primary,type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:"Hex",font:"Arial",size:18,bold:true,color:C.white})]})] }),
        new TableCell({ width:{size:W[2],type:WidthType.DXA}, borders, margins:cm, shading:{fill:C.primary,type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:"Token",font:"Arial",size:18,bold:true,color:C.white})]})] }),
        new TableCell({ width:{size:W[3],type:WidthType.DXA}, borders, margins:cm, shading:{fill:C.primary,type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:"Usage",font:"Arial",size:18,bold:true,color:C.white})]})] }),
      ]}),
      ...colors.map(({name,hex,role,usage},i) => new TableRow({ children: [
        new TableCell({ width:{size:W[0],type:WidthType.DXA}, borders, margins:cm, shading:{fill:hex,type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:name,font:"Arial",size:18,bold:true,color:"ffffff"})]})] }),
        new TableCell({ width:{size:W[1],type:WidthType.DXA}, borders, margins:cm, shading:{fill:i%2===0?"f4f6ff":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:"#"+hex,font:"Arial",size:18,color:C.onSurface})]})] }),
        new TableCell({ width:{size:W[2],type:WidthType.DXA}, borders, margins:cm, shading:{fill:i%2===0?"f4f6ff":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:role,font:"Arial",size:18,color:C.primary,bold:true})]})] }),
        new TableCell({ width:{size:W[3],type:WidthType.DXA}, borders, margins:cm, shading:{fill:i%2===0?"f4f6ff":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:usage,font:"Arial",size:18,color:C.onSurface})]})] }),
      ]}))
    ]
  });
}

// ── Screen spec table ─────────────────────────────────────────────────────
function screenTable(rows) {
  // rows = [{element, spec, token, notes}]
  const W = [1800,2000,2000,3560];
  return new Table({
    width:{size:9360,type:WidthType.DXA}, columnWidths:W,
    rows:[
      new TableRow({ children:[
        ...[["Element",W[0]],["Spec / Value",W[1]],["Token",W[2]],["Notes",W[3]]].map(([h,w])=>
          new TableCell({width:{size:w,type:WidthType.DXA},borders,margins:cm,shading:{fill:C.primary,type:ShadingType.CLEAR},
            children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]})
        )
      ]}),
      ...rows.map(({element,spec,token,notes},i)=>new TableRow({children:[
        new TableCell({width:{size:W[0],type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:element,font:"Arial",size:18,bold:true,color:C.primary})]})] }),
        new TableCell({width:{size:W[1],type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:spec,font:"Arial",size:18,color:C.onSurface})]})] }),
        new TableCell({width:{size:W[2],type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:token,font:"Arial",size:18,color:C.navy,bold:true})]})] }),
        new TableCell({width:{size:W[3],type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
          children:[new Paragraph({children:[new TextRun({text:notes,font:"Arial",size:18,color:C.onSurfVar})]})] }),
      ]}))
    ]
  });
}

// ── Info box ──────────────────────────────────────────────────────────────
function infoBox(label, lines, bg="eef1fb", accent=C.primary) {
  return new Table({
    width:{size:9360,type:WidthType.DXA}, columnWidths:[9360],
    rows:[new TableRow({children:[new TableCell({
      width:{size:9360,type:WidthType.DXA},
      borders:leftAccent, margins:{top:80,bottom:80,left:200,right:160},
      shading:{fill:bg,type:ShadingType.CLEAR},
      children:[
        new Paragraph({children:[new TextRun({text:label,font:"Arial",size:20,bold:true,color:accent})]}),
        ...lines.map(l=>new Paragraph({children:[new TextRun({text:l,font:"Arial",size:19,color:C.onSurface})]}))
      ]
    })
    ]
  });
  // fixed

}

// ── Two-column spec box ───────────────────────────────────────────────────
function twoCol(left, right) {
  return new Table({
    width:{size:9360,type:WidthType.DXA}, columnWidths:[4560,4800],
    rows:[new TableRow({children:[
      new TableCell({width:{size:4560,type:WidthType.DXA},borders:noBorders,margins:{top:0,bottom:0,left:0,right:240},
        children:left}),
      new TableCell({width:{size:4800,type:WidthType.DXA},borders:noBorders,margins:{top:0,bottom:0,left:240,right:0},
        children:right}),
    ]})]
  });
}

// ── Page break ────────────────────────────────────────────────────────────
function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ══════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ══════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      { reference:"bullets", levels:[{level:0,format:LevelFormat.BULLET,text:"\u2022",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:720,hanging:360}}}}] },
      { reference:"numbers", levels:[{level:0,format:LevelFormat.DECIMAL,text:"%1.",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:720,hanging:360}}}}] },
      { reference:"alpha", levels:[{level:0,format:LevelFormat.LOWER_LETTER,text:"%1.",alignment:AlignmentType.LEFT,
          style:{paragraph:{indent:{left:720,hanging:360}}}}] },
    ]
  },
  styles: {
    default: { document:{ run:{ font:"Arial", size:20 } } },
    paragraphStyles: [
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:36,bold:true,font:"Arial",color:C.primary},
        paragraph:{spacing:{before:320,after:120},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:28,bold:true,font:"Arial",color:C.primary},
        paragraph:{spacing:{before:240,after:80},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:24,bold:true,font:"Arial",color:C.navy},
        paragraph:{spacing:{before:180,after:60},outlineLevel:2}},
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width:12240, height:15840 },
        margin: { top:1080, right:1080, bottom:1080, left:1080 }
      }
    },
    children: [

      // ════════════════ COVER ════════════════
      ...spacer(2),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:80},
        children:[new TextRun({text:"GYAN PATH", font:"Arial", size:72, bold:true, color:C.primary})] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:60},
        children:[new TextRun({text:"UI/UX Design System & Screen Specification", font:"Arial", size:32, color:C.navy})] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:40},
        children:[new TextRun({text:"Editorial Intelligence — Living Canvas Design Philosophy", font:"Arial", size:22, color:C.onSurfVar, italics:true})] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:60,after:0},
        children:[new TextRun({text:"Version 1.0  |  April 2026  |  Confidential", font:"Arial", size:18, color:C.gray})] }),
      ...spacer(1),
      divider(C.primary),
      ...spacer(1),
      new Paragraph({ alignment:AlignmentType.CENTER,
        children:[new TextRun({text:"Document Scope", font:"Arial", size:22, bold:true, color:C.navy})] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:40,after:0},
        children:[new TextRun({text:"This document defines the complete UI/UX specification for the Gyan Path student platform.", font:"Arial", size:20, color:C.onSurface})] }),
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:0,after:0},
        children:[new TextRun({text:"It covers: design philosophy, color tokens, typography, components, all 8 screens, and developer handoff guidelines.", font:"Arial", size:20, color:C.onSurface})] }),
      ...spacer(1),

      // ── Quick reference table ──
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[4680,4680],
        rows:[
          new TableRow({children:[
            new TableCell({width:{size:4680,type:WidthType.DXA},borders,margins:cm,shading:{fill:C.primary,type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:"Section",font:"Arial",size:20,bold:true,color:C.white})]})] }),
            new TableCell({width:{size:4680,type:WidthType.DXA},borders,margins:cm,shading:{fill:C.primary,type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:"Page",font:"Arial",size:20,bold:true,color:C.white})]})] }),
          ]}),
          ...[
            ["1. Design Philosophy & North Star","2"],
            ["2. Color System & Tokens","3"],
            ["3. Typography System","4"],
            ["4. Elevation, Shadow & Surface Rules","5"],
            ["5. Component Library","6"],
            ["6. Screen 1 — Onboarding / Language Selection","8"],
            ["7. Screen 2 — Home Dashboard","9"],
            ["8. Screen 3 — Quiz Screen","11"],
            ["9. Screen 4 — AI Assistant","13"],
            ["10. Screen 5 — Battle Arena","15"],
            ["11. Screen 6 — Digital Library","16"],
            ["12. Screen 7 — Wallet","18"],
            ["13. Screen 8 — Home Dashboard (Dark Variant)","19"],
            ["14. Navigation System","20"],
            ["15. Do's and Don'ts","21"],
            ["16. Developer Handoff","22"],
          ].map(([sec,pg],i)=>new TableRow({children:[
            new TableCell({width:{size:4680,type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:sec,font:"Arial",size:19,color:C.onSurface})]})] }),
            new TableCell({width:{size:4680,type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:pg,font:"Arial",size:19,color:C.primary,bold:true})]})] }),
          ]}))
        ]
      }),

      pb(),

      // ════════════════ SECTION 1 — DESIGN PHILOSOPHY ════════════════
      sectionBanner("1. Design Philosophy & Creative North Star"),
      ...spacer(1),
      h2("1.1 Editorial Intelligence"),
      body("Gyan Path's design language is called \"Editorial Intelligence.\" It treats the interface like a premium interactive textbook — clean, authoritative, and spacious. Every pixel choice is intentional. The platform must feel like high-end stationery brought to life through digital light, not like a generic educational portal."),
      ...spacer(1),
      infoBox("The Creative North Star: Living Canvas", [
        "We break the \"template\" look through intentional asymmetry: large bold typographic headers paired with off-center floating elements and overlapping surfaces that suggest depth and motion.",
        "The result should feel editorial — something between a premium magazine and a fintech app — while remaining warm and student-friendly."
      ]),
      ...spacer(1),
      h2("1.2 Core Design Principles"),
      ...spacer(1),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2000,7360],
        rows:[
          ...[
            ["No-Line Rule","Never use 1px solid borders to divide content. Use background shifts, tonal transitions, and whitespace instead."],
            ["Tonal Depth","Depth is created by stacking surfaces: surface-container-lowest on surface-container-low creates lift without shadows."],
            ["Ambient Softness","Shadows use tinted colors (never pure black). Box-shadow: 0 12px 32px rgba(13,28,46,0.06)."],
            ["Friendly Roundness","No hard 90-degree corners anywhere. xl (1.5rem) and lg (1rem) border-radius throughout."],
            ["Generous Whitespace","32px+ between major content blocks. Content breathes — never cramped."],
            ["Glass & Gradient","Hero sections use linear gradients. Nav bars and floating elements use glassmorphism (80% opacity + 20px blur)."],
          ].map(([p,d],i)=>new TableRow({children:[
            new TableCell({width:{size:2000,type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"dce9ff":"eef1fb",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:p,font:"Arial",size:18,bold:true,color:C.primary})]})] }),
            new TableCell({width:{size:7360,type:WidthType.DXA},borders,margins:cm,shading:{fill:i%2===0?"f4f6ff":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:d,font:"Arial",size:18,color:C.onSurface})]})] }),
          ]}))
        ]
      }),
      ...spacer(1),
      h2("1.3 Dual Theme Support"),
      body("Gyan Path supports both Light Mode and Dark Mode. Light mode uses the surface architecture described below. Dark mode (seen in Battle Arena, Library, and Home Dark) uses a deep navy/charcoal (#0d1117) base with elevated card surfaces (#161b22) and reduced opacity accent colours. Both modes share identical component shapes and spacing — only surface colors and text colors change."),

      pb(),

      // ════════════════ SECTION 2 — COLOR SYSTEM ════════════════
      sectionBanner("2. Color System & Design Tokens"),
      ...spacer(1),
      h2("2.1 Primary Palette"),
      body("All colours are defined as design tokens. Developers must reference tokens — never hardcode hex values in components."),
      ...spacer(1),
      colorTable([
        {name:"Primary",        hex:"24389c", role:"primary",             usage:"Navigation, CTA buttons, structural anchors, headings"},
        {name:"Primary Cont.",  hex:"3f51b5", role:"primary_container",   usage:"Gradient endpoint for hero sections and primary buttons"},
        {name:"Secondary",      hex:"8b5000", role:"secondary",            usage:"Coin icons, reward system, energy indicators"},
        {name:"Sec. Container", hex:"ff9800", role:"secondary_container", usage:"Claim Reward / Start Quiz button fills"},
        {name:"Tertiary",       hex:"004e33", role:"tertiary",            usage:"Progress bars (fill), success states, growth indicators"},
        {name:"Tertiary Fixed", hex:"6ffbbe", role:"tertiary_fixed",      usage:"Progress bar background track"},
        {name:"On Sec. Cont.",  hex:"653900", role:"on_secondary_cont.",  usage:"Text on secondary container backgrounds"},
      ]),
      ...spacer(1),
      h2("2.2 Surface Architecture"),
      body("Surfaces are stacked like semi-translucent sheets. The hierarchy below defines depth — place lower numbers on top of higher numbers to create lift."),
      ...spacer(1),
      colorTable([
        {name:"Surface",         hex:"f8f9ff", role:"surface",                      usage:"Base page background for all light mode screens"},
        {name:"Surf. Low",       hex:"eef1fb", role:"surface_container_low",        usage:"Card backgrounds, section separators"},
        {name:"Surf. High",      hex:"dce9ff", role:"surface_container_high",       usage:"Interactive sidebars, floating drawers"},
        {name:"Surf. Lowest",    hex:"ffffff", role:"surface_container_lowest",     usage:"Main content cards, quiz question container"},
        {name:"On Surface",      hex:"0d1c2e", role:"on_surface",                   usage:"Primary body text (never use pure black #000000)"},
        {name:"On Surf. Var.",   hex:"454652", role:"on_surface_variant",           usage:"Secondary text, captions, timestamps"},
        {name:"Outline Variant", hex:"c5c5d4", role:"outline_variant",             usage:"Ghost borders at 15% opacity when accessibility requires"},
      ]),
      ...spacer(1),
      h2("2.3 Dark Mode Surface Tokens"),
      colorTable([
        {name:"Dark Base",   hex:"0d1117", role:"dark_surface",        usage:"Full screen background in dark mode"},
        {name:"Dark Card",   hex:"161b22", role:"dark_surface_low",   usage:"Card and container backgrounds in dark mode"},
        {name:"Dark Raised", hex:"1f2937", role:"dark_surface_high",  usage:"Elevated elements (modals, drawers) in dark mode"},
        {name:"Dark Text",   hex:"e6edf3", role:"dark_on_surface",    usage:"Primary text in dark mode"},
        {name:"Dark Muted",  hex:"8b949e", role:"dark_on_surf_var",   usage:"Secondary / caption text in dark mode"},
      ]),

      pb(),

      // ════════════════ SECTION 3 — TYPOGRAPHY ════════════════
      sectionBanner("3. Typography System"),
      ...spacer(1),
      h2("3.1 Font Stack"),
      infoBox("Dual-Font Strategy", [
        "Display & Headlines: Plus Jakarta Sans — the editorial voice. Use for welcome screens, module titles, numeric values (fintech-lite feel).",
        "Body & Labels: Inter — the utility voice. Maximum legibility during long reading sessions.",
        "Fallback stack: system-ui, -apple-system, Arial, sans-serif"
      ]),
      ...spacer(1),
      h2("3.2 Type Scale"),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2000,1600,1400,1360,3000],
        rows:[
          new TableRow({children:[
            ...["Token","Font","Size","Weight","Usage"].map((h,i)=>
              new TableCell({width:{size:[2000,1600,1400,1360,3000][i],type:WidthType.DXA},borders,margins:cm,
                shading:{fill:C.primary,type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]}))
          ]}),
          ...[
            ["display-lg","Plus Jakarta","3rem / 48px","700","Welcome / splash screens"],
            ["display-md","Plus Jakarta","2.25rem / 36px","700","Hero section titles"],
            ["display-sm","Plus Jakarta","1.875rem / 30px","700","Wallet balance figure"],
            ["headline-lg","Plus Jakarta","1.5rem / 24px","700","Module and page titles"],
            ["headline-md","Plus Jakarta","1.25rem / 20px","600","Card headings, quiz question"],
            ["title-sm","Inter","0.875rem / 14px","500","Subtitles, hook-and-detail rhythm"],
            ["body-md","Inter","0.875rem / 14px","400","All educational body content"],
            ["body-sm","Inter","0.75rem / 12px","400","Captions, timestamps, meta"],
            ["label-lg","Inter","0.875rem / 14px","500","Button text, tab labels"],
            ["label-sm","Inter","0.75rem / 12px","500","Tags, badges, pill labels"],
          ].map(([t,f,s,w,u],i)=>new TableRow({children:[
            ...[[t,2000],[f,1600],[s,1400],[w,1360],[u,3000]].map(([val,wid],ci)=>
              new TableCell({width:{size:wid,type:WidthType.DXA},borders,margins:cm,
                shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:val,font:"Arial",size:18,
                  bold:ci===0,color:ci===0?C.primary:C.onSurface})]})]}))
          ]}))
        ]
      }),
      ...spacer(1),
      h2("3.3 Typographic Rules"),
      bullet("Headlines use letter-spacing: -0.02em for bespoke high-end feel"),
      bullet("Always lead with headline-lg followed by title-sm in on_surface_variant — the hook-and-detail rhythm"),
      bullet("Use Plus Jakarta Sans for ALL numeric values (coin balances, scores, ranks, percentages)"),
      bullet("Never use pure black (#000000) for text — always use on_surface (#0d1c2e)"),
      bullet("Line height: 1.4 for headlines, 1.6 for body, 1.5 for labels"),

      pb(),

      // ════════════════ SECTION 4 — ELEVATION & DEPTH ════════════════
      sectionBanner("4. Elevation, Depth & Shadow System"),
      ...spacer(1),
      h2("4.1 The Layering Principle"),
      body("Traditional box-shadows are \"dirty\" — they break the premium feel. Gyan Path uses Ambient Softness: depth through surface stacking rather than explicit shadow values."),
      ...spacer(1),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[1600,2200,2200,3360],
        rows:[
          new TableRow({children:[
            ...["Elevation Level","Surface Token","Background Token","Example Use"].map((h,i)=>
              new TableCell({width:{size:[1600,2200,2200,3360][i],type:WidthType.DXA},borders,margins:cm,
                shading:{fill:C.primary,type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]}))
          ]}),
          ...[
            ["Level 0 (Base)","surface (#f8f9ff)","page background","Screen / page canvas"],
            ["Level 1 (Raised)","surface_container_low","surface","Card sections, subject categories"],
            ["Level 2 (Float)","surface_container_lowest","surface_container_low","Quiz question card, main content focus"],
            ["Level 3 (Overlay)","surface_container_high","surface_container_low","AI chat sidebar, filter drawers"],
            ["Level 4 (Modal)","surface_container_lowest + shadow","any level","Modals, bottom sheets, tooltips"],
          ].map(([l,s,b,e],i)=>new TableRow({children:[
            ...[l,s,b,e].map((v,ci)=>new TableCell({width:{size:[1600,2200,2200,3360][ci],type:WidthType.DXA},borders,margins:cm,
              shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:v,font:"Arial",size:18,
                bold:ci===0,color:ci===0?C.primary:C.onSurface})]})]}))
          ]}))
        ]
      }),
      ...spacer(1),
      h2("4.2 Shadow Specification"),
      infoBox("Ambient Shadow (Level 4 only)", [
        "box-shadow: 0 12px 32px rgba(13, 28, 46, 0.06)",
        "The shadow color is a tinted version of on-surface, never pure black.",
        "Use only for: floating AI bubbles, modal overlays, bottom drawer handles."
      ], "eef1fb", C.primary),
      ...spacer(1),
      h2("4.3 Ghost Border Fallback"),
      body("When accessibility requires a visible boundary (e.g., WCAG 1.4.11 non-text contrast), use the Ghost Border: outline-variant (#c5c5d4) at 15% opacity. It must be felt, not seen — 0.5px width maximum."),
      h2("4.4 Glassmorphism Spec"),
      bullet("Background color: surface (#f8f9ff) at 80% opacity"),
      bullet("Backdrop filter: blur(20px)"),
      bullet("Use for: mobile nav bar, floating AI chat bubble, wallet balance glass card"),
      bullet("Never apply glassmorphism to content-heavy cards — only decorative/floating elements"),

      pb(),

      // ════════════════ SECTION 5 — COMPONENTS ════════════════
      sectionBanner("5. Component Library"),
      ...spacer(1),
      h2("5.1 Buttons"),
      screenTable([
        {element:"Primary Button",spec:"Gradient fill: primary → primary_container at 135°, xl radius (1.5rem), height 52px",token:"btn-primary",notes:"Use for main actions: Submit Answer, Get Started, Generate Report"},
        {element:"Secondary Button",spec:"secondary_container (#ff9800) fill, on_secondary_container (#653900) text, xl radius",token:"btn-secondary",notes:"Use for reward actions: Claim Reward, Start Quiz, Use Hint"},
        {element:"Tertiary Button",spec:"No fill, primary (#24389c) text, xl radius, transparent background",token:"btn-tertiary",notes:"Use for: Back, Skip, Cancel Matchmaking, Previous Question"},
        {element:"Glass Button",spec:"surface at 80% opacity, blur(20px), outline-variant ghost border, lg radius",token:"btn-glass",notes:"Floating actions on dark backgrounds (Battle Arena, Library dark)"},
      ]),
      ...spacer(1),
      h2("5.2 Cards"),
      screenTable([
        {element:"Content Card",spec:"surface_container_lowest bg, lg radius (1rem), Level 2 elevation, 24px padding",token:"card-content",notes:"Quiz question container, module description, library book card"},
        {element:"Progress Card",spec:"surface_container_low bg, xl radius, left accent border in tertiary (#004e33)",token:"card-progress",notes:"Daily streak, monthly progress, study tracker"},
        {element:"Glass Wallet Card",spec:"primary (#24389c) at 70% opacity, blur(20px), xl radius, white text",token:"card-wallet",notes:"Coin balance display in Wallet screen"},
        {element:"Featured Hero Card",spec:"Gradient bg (primary to primary_container 135°), full width, xl radius, 32px padding",token:"card-hero",notes:"Recommended content in Home dashboard"},
        {element:"Action Icon Card",spec:"surface_container_low bg, lg radius, centered icon + label, 80px × 80px",token:"card-action",notes:"Pathway grid: Daily Quiz, Library, Assistant, Wallet, Admissions, Jobs"},
      ]),
      ...spacer(1),
      h2("5.3 Quiz Answer Options"),
      screenTable([
        {element:"Option (unselected)",spec:"surface_container_low bg, xl radius, 16px vertical padding, no border",token:"option-default",notes:"Never use a divider line between options — use md vertical spacing"},
        {element:"Option (hover)",spec:"surface_container bg (slightly darker), scale 1.01 transition 150ms",token:"option-hover",notes:"Touch feedback on mobile — use onPress opacity change"},
        {element:"Option (selected correct)",spec:"primary fill (#24389c), white text + check icon, xl radius",token:"option-correct",notes:"Selected state with answer confirmed"},
        {element:"Letter Badge",spec:"surface_container_high bg circle 36px, primary text for default / white for selected",token:"option-badge",notes:"A, B, C, D labels on left of each option"},
      ]),
      ...spacer(1),
      h2("5.4 Progress Bar"),
      screenTable([
        {element:"Track",spec:"tertiary_fixed (#6ffbbe), height 8px, xl radius, full width",token:"progress-track",notes:"Background rail of all progress bars"},
        {element:"Fill",spec:"tertiary (#004e33), height 8px, animated width transition 400ms ease",token:"progress-fill",notes:"Active fill that grows as progress increases"},
        {element:"Label (left)",spec:"on_surface_variant text, label-sm, uppercase, letter-spacing 0.08em",token:"progress-label",notes:"e.g., '18 MODULES DONE'"},
        {element:"Label (right)",spec:"on_surface_variant text, label-sm",token:"progress-label-end",notes:"e.g., '6 REMAINING'"},
      ]),
      ...spacer(1),
      h2("5.5 Navigation Bar"),
      screenTable([
        {element:"Nav Container",spec:"surface at 80% opacity, blur(20px), fixed bottom, 64px height, 0 shadow",token:"nav-bar",notes:"Glassmorphism — the only nav treatment allowed"},
        {element:"Active Tab",spec:"primary fill pill behind icon, icon in white, label in primary, label-sm bold",token:"nav-active",notes:"Currently selected tab only"},
        {element:"Inactive Tab",spec:"No fill, icon in on_surface_variant, label in on_surface_variant, label-sm",token:"nav-inactive",notes:"All other tabs"},
        {element:"Tab Icon",spec:"24px × 24px, 2px stroke weight",token:"nav-icon",notes:"Use outlined icons for inactive, filled for active"},
      ]),
      ...spacer(1),
      h2("5.6 AI Chat Bubbles"),
      screenTable([
        {element:"AI Bubble",spec:"surface_container_high (#dce9ff) bg, lg radius, bottom-left corner 0 (sharp)",token:"bubble-ai",notes:"Creates organic asymmetric flow — never use symmetric rounded corners"},
        {element:"User Bubble",spec:"primary (#24389c) bg, white text, lg radius, bottom-right corner 0 (sharp)",token:"bubble-user",notes:"User messages always flush right"},
        {element:"AI Avatar",spec:"40px circle, primary bg, white robot icon, top-left aligned with bubble",token:"avatar-ai",notes:"Floats beside AI bubbles — uses ambient shadow"},
        {element:"Suggestion Chip",spec:"surface_container_high bg, primary text, label-sm, lg radius, 32px height",token:"chip-suggest",notes:"Scrollable row of quick-reply suggestions below chat"},
      ]),
      ...spacer(1),
      h2("5.7 Coin & Wallet Elements"),
      screenTable([
        {element:"Coin Icon",spec:"secondary (#8b5000) color, 24px circular badge, trophy or coin glyph",token:"icon-coin",notes:"Used in header balance, reward notifications"},
        {element:"Balance Display",spec:"display-sm (30px) Plus Jakarta Sans, white text on glass card",token:"wallet-balance",notes:"The large number — uses numeric fintech font treatment"},
        {element:"INR Conversion",spec:"surface_container_high pill, body-sm, on_surface_variant text",token:"wallet-inr",notes:"Approximate INR value below coin balance"},
        {element:"Transaction Row",spec:"Icon (40px, surface_container_low bg) + label + date + amount right-aligned",token:"tx-row",notes:"No border between rows — use 16px vertical spacing only"},
        {element:"+ Amount",spec:"tertiary (#004e33) text, label-lg bold",token:"tx-credit",notes:"Credit amounts (quiz win, referral, question approved)"},
        {element:"- Amount",spec:"error red text, label-lg bold",token:"tx-debit",notes:"Debit amounts (library access, battle entry)"},
      ]),

      pb(),

      // ════════════════ SECTION 6 — ONBOARDING ════════════════
      sectionBanner("6. Screen 1 — Onboarding / Language Selection"),
      ...spacer(1),
      h2("6.1 Screen Purpose"),
      body("The onboarding screen is the first impression. It must communicate premium quality and educational authority within seconds. Language selection happens here — critical for India's multilingual student base."),
      ...spacer(1),
      h2("6.2 Layout Structure"),
      numbered("Hero image: Library/bookshelf photograph with gradient overlay (primary to transparent, 135°). Rounded xl corners. Full width, ~45% viewport height."),
      numbered("Heading block: 'Namaste.' in display-md (Plus Jakarta), primary color. Subtext 'Select your preferred learning path to begin.' in body-md, on_surface_variant."),
      numbered("Language selector: CHOOSE LANGUAGE label in label-sm uppercase. Each language as a card (surface_container_lowest bg, xl radius, 64px height). Selected card gets primary border (2px) and primary check icon."),
      numbered("CTA: 'Get Started →' Primary gradient button, full width, xl radius, 52px height."),
      numbered("Step indicator: 3 dots below CTA. Active dot = primary, inactive = outline_variant. 'Step 1 of 3' in label-sm."),
      numbered("Reward nudge: secondary_container (#ff9800) icon + 'Start earning Gyan Coins' in secondary color. Motivational card with amber accent."),
      ...spacer(1),
      h2("6.3 Detailed Specifications"),
      screenTable([
        {element:"Hero image overlay",spec:"linear-gradient(135°, #24389c 0%, transparent 100%)",token:"hero-gradient",notes:"Ensures text readability on photograph"},
        {element:"GyanPath logo",spec:"White color on hero, primary on light bg, 24px height",token:"logo",notes:"Appears top-left on hero card"},
        {element:"Language option (selected)",spec:"2px solid primary border, primary check icon right-aligned, headline text in primary",token:"lang-selected",notes:"English — Standard Academic"},
        {element:"Language option (default)",spec:"No border, ghost border fallback at 15%, body-md on_surface text",token:"lang-default",notes:"Hindi, Bengali, Marathi options"},
        {element:"Reward nudge card",spec:"secondary_container (#ff9800) 56px icon container, secondary text for headline",token:"nudge-reward",notes:"'Complete your profile to claim first 50 coins'"},
        {element:"Footer legal text",spec:"body-sm, on_surface_variant, center aligned, 32px top margin",token:"text-legal",notes:"'By continuing, you agree to our Editorial Ethics & Learning Policy.'"},
      ]),

      pb(),

      // ════════════════ SECTION 7 — HOME DASHBOARD ════════════════
      sectionBanner("7. Screen 2 — Home Dashboard (Light Mode)"),
      ...spacer(1),
      h2("7.1 Screen Purpose"),
      body("The Home Dashboard is the student control centre. It must surface the most relevant content immediately and provide fast access to all major modules. The design balances editorial hierarchy with utility navigation."),
      ...spacer(1),
      h2("7.2 Header Bar"),
      screenTable([
        {element:"Avatar",spec:"40px circle, student photo or initials, top-left",token:"avatar-user",notes:"Taps to open Profile"},
        {element:"App name",spec:"headline-md 'GyanPath' or 'Gyan Path', on_surface bold",token:"header-title",notes:"Center aligned"},
        {element:"Coin balance",spec:"secondary container pill: coin icon + number in Plus Jakarta Sans label-lg",token:"header-coins",notes:"Shows current Gyan Coin count"},
        {element:"Notification bell",spec:"24px icon, on_surface_variant, badge dot in secondary for unread",token:"header-notif",notes:"Top right corner"},
      ]),
      ...spacer(1),
      h2("7.3 Welcome Block"),
      screenTable([
        {element:"Greeting",spec:"display-md 'Namaste, [Name]', Plus Jakarta Sans, on_surface, letter-spacing -0.02em",token:"greeting-headline",notes:"Personalised — pulls student name from profile"},
        {element:"Subline",spec:"body-md, on_surface_variant, 8px top margin",token:"greeting-sub",notes:"'Your editorial journey through knowledge continues.'"},
      ]),
      ...spacer(1),
      h2("7.4 Recommended Hero Card"),
      screenTable([
        {element:"Card bg",spec:"Gradient primary → primary_container 135°, xl radius, 180px height",token:"hero-card",notes:"Full width, 16px horizontal margin"},
        {element:"Label chip",spec:"'RECOMMENDED' in surface_container_high bg, primary text, label-sm, lg radius",token:"chip-rec",notes:"Top-left corner of card"},
        {element:"Title",spec:"headline-lg white, Plus Jakarta, -0.02em letter-spacing, 2-3 lines",token:"hero-title",notes:"Module name — truncate at 3 lines"},
        {element:"CTA",spec:"'Resume Learning' tertiary button — white fill, primary text, lg radius",token:"hero-cta",notes:"Inside the hero card, bottom area"},
      ]),
      ...spacer(1),
      h2("7.5 Daily Streak Card"),
      screenTable([
        {element:"Container",spec:"surface_container_lowest bg, xl radius, 24px padding, Level 2 elevation",token:"streak-card",notes:"Left accent border in secondary (#8b5000)"},
        {element:"Icon",spec:"48px secondary_container bg circle, arrow-up icon in secondary",token:"streak-icon",notes:"Top-left of card"},
        {element:"Streak count",spec:"display-sm '12/15' right-aligned, secondary color, Plus Jakarta",token:"streak-count",notes:"Current / goal format"},
        {element:"Day indicators",spec:"7 pill shapes, M T W T F S S — filled secondary for completed, outline for future",token:"streak-days",notes:"Horizontal scrollable row of weekly day pills"},
        {element:"Description",spec:"body-sm 'You are on a 12-day streak! Complete today\'s quiz to earn 50 Gyan Coins.'",token:"streak-desc",notes:"on_surface_variant text"},
      ]),
      ...spacer(1),
      h2("7.6 Pathways Grid"),
      screenTable([
        {element:"Section heading",spec:"headline-md 'Pathways', on_surface, 32px top margin",token:"section-head",notes:"No divider line — use whitespace only"},
        {element:"Grid layout",spec:"2 columns, 8px gap, 3 rows = 6 items (Quiz, Library, Assistant, Wallet, Admissions, Jobs)",token:"pathway-grid",notes:"Extends to show all 6 pathways"},
        {element:"Pathway card",spec:"surface_container_low bg, xl radius, 80px × 80px, centered icon 24px + label body-sm below",token:"card-pathway",notes:"Icon uses primary color, label uses on_surface"},
      ]),
      ...spacer(1),
      h2("7.7 Monthly Learning Progress"),
      screenTable([
        {element:"Section heading",spec:"headline-md, 32px top margin",token:"section-head",notes:""},
        {element:"Progress bar",spec:"8px height, tertiary_fixed track, tertiary fill, xl radius, animated",token:"progress-monthly",notes:"Reflects % of monthly target completed"},
        {element:"Stats row",spec:"'18 MODULES DONE' left, '6 REMAINING' right, label-sm uppercase, on_surface_variant",token:"progress-stats",notes:"Below the bar"},
        {element:"Report button",spec:"Primary gradient button 'Generate Report', full width, 52px, xl radius",token:"btn-report",notes:"Opens detailed analytics view"},
      ]),

      pb(),

      // ════════════════ SECTION 8 — QUIZ SCREEN ════════════════
      sectionBanner("8. Screen 3 — Quiz Screen"),
      ...spacer(1),
      h2("8.1 Screen Purpose"),
      body("The quiz screen is the primary engagement engine. It must be distraction-free, clear, and motivating. The student should feel focused and confident — never confused. The design strips back to essential elements only."),
      ...spacer(1),
      h2("8.2 Header"),
      screenTable([
        {element:"Logo + Name",spec:"24px logo icon + 'GyanPath' headline-md, top-left",token:"header-logo",notes:"Minimal — no coin display in quiz to reduce distraction"},
        {element:"Timer",spec:"secondary_container pill — clock icon + MM:SS, label-lg Plus Jakarta",token:"quiz-timer",notes:"Counts down. Turns red below 30 seconds."},
      ]),
      ...spacer(1),
      h2("8.3 Module Context"),
      screenTable([
        {element:"Module label",spec:"'CURRENT MODULE' in label-sm, on_surface_variant, uppercase",token:"module-label",notes:"Above the module title"},
        {element:"Module title",spec:"display-md Plus Jakarta, primary color, -0.02em letter-spacing",token:"module-title",notes:"e.g., 'Ancient Indian Economics'"},
        {element:"Question counter",spec:"'Question 05 / 10' — 'Question' in body-sm on_surface_variant, '05' in display-sm primary",token:"question-counter",notes:"Right-aligned, creates intentional asymmetry"},
        {element:"Progress bar",spec:"8px thick, tertiary_fixed track, tertiary fill, 16px top margin",token:"quiz-progress",notes:"Fills as questions completed (5/10 = 50%)"},
      ]),
      ...spacer(1),
      h2("8.4 Question Card"),
      screenTable([
        {element:"Container",spec:"surface_container_lowest (#ffffff) bg, xl radius, 24px padding, Level 2 elevation, 32px top margin",token:"question-card",notes:"Main focus area — never add a border or shadow beyond Level 2"},
        {element:"Question text",spec:"headline-md Inter, on_surface (#0d1c2e), 1.6 line-height",token:"question-text",notes:"Question number watermark (e.g., '05') in on_surface at 5% opacity as background element — adds editorial depth"},
        {element:"Answer options",spec:"surface_container_low bg each, xl radius, 16px vertical padding, 12px top gap between each",token:"option-card",notes:"NEVER use a divider line between options"},
        {element:"Option selected",spec:"primary (#24389c) fill, white text + bold, check icon right-aligned 20px",token:"option-selected",notes:"B option shows this state in the reference screen"},
        {element:"Letter badge",spec:"36px circle, surface_container_high bg, primary label-lg — turns white on selection",token:"option-letter",notes:"A, B, C, D consistent alignment"},
      ]),
      ...spacer(1),
      h2("8.5 Action Row"),
      screenTable([
        {element:"Previous button",spec:"Tertiary — arrow-left icon + 'Previous Question' text, on_surface, body-md",token:"btn-prev",notes:"Center aligned, 32px top margin from last option"},
        {element:"Hint button",spec:"surface_container_high bg, primary text, lightbulb icon, 'Use Hint (-5 Coins)', xl radius, full width",token:"btn-hint",notes:"Cost shown inline — deters overuse. Uses glass-like treatment."},
        {element:"Submit button",spec:"Primary gradient, white text 'Submit Answer →', xl radius, 52px height, full width",token:"btn-submit",notes:"Always full width. Dominant CTA."},
      ]),

      pb(),

      // ════════════════ SECTION 9 — AI ASSISTANT ════════════════
      sectionBanner("9. Screen 4 — AI Assistant (Digital Mentor)"),
      ...spacer(1),
      h2("9.1 Screen Purpose"),
      body("The AI Assistant is branded as 'Your Personal Digital Mentor.' It must feel warm, intelligent, and conversational — like a knowledgeable tutor, not a cold chatbot. The asymmetric bubble design creates organic conversation flow."),
      ...spacer(1),
      h2("9.2 Header"),
      screenTable([
        {element:"Avatar",spec:"Student photo circle 40px top-left",token:"avatar-user",notes:""},
        {element:"App name",spec:"headline-md 'GyanPath' center",token:"header-title",notes:""},
        {element:"Coin balance",spec:"secondary_container pill with coin count",token:"header-coins",notes:""},
        {element:"More menu",spec:"3-dot vertical icon, 24px, on_surface_variant",token:"header-more",notes:"Opens settings, history, export"},
      ]),
      ...spacer(1),
      h2("9.3 Mentor Introduction Block"),
      screenTable([
        {element:"Bot icon container",spec:"88px circle, primary gradient fill, white robot icon 48px",token:"mentor-icon",notes:"Centered, 32px top margin"},
        {element:"Headline",spec:"display-md 'Your Personal Digital Mentor', Plus Jakarta, on_surface, center",token:"mentor-headline",notes:""},
        {element:"Subtext",spec:"body-md on_surface_variant, center, max 2 lines, 16px top margin",token:"mentor-sub",notes:"'I\'m here to help you master your curriculum...'"},
      ]),
      ...spacer(1),
      h2("9.4 Chat Messages"),
      screenTable([
        {element:"AI message bubble",spec:"surface_container_high (#dce9ff) bg, lg radius, bottom-left 0, max-width 85%, left-aligned",token:"bubble-ai",notes:"Padding 16px. Body-md Inter on_surface text."},
        {element:"User message bubble",spec:"primary (#24389c) bg, white text, lg radius, bottom-right 0, right-aligned, max-width 80%",token:"bubble-user",notes:"Padding 16px. Body-md Inter white text."},
        {element:"AI avatar",spec:"32px circle, primary bg, white robot icon, top-left of message, 8px right gap",token:"avatar-ai",notes:"Appears only on first AI message in a group"},
        {element:"User avatar",spec:"32px circle, student photo, top-right of message, 8px left gap",token:"avatar-user-msg",notes:"Appears only on first user message in a group"},
        {element:"Message spacing",spec:"16px between message bubbles, 24px between conversation turns",token:"chat-spacing",notes:""},
        {element:"Key Formula card",spec:"surface_container_lowest bg, lg radius, 16px padding inside AI bubble, 'KEY FORMULA' label in primary label-sm uppercase + left border accent",token:"formula-card",notes:"Nested inside AI message for mathematical content"},
      ]),
      ...spacer(1),
      h2("9.5 Input Bar"),
      screenTable([
        {element:"Container",spec:"surface at 80% opacity, blur(20px), fixed bottom above nav bar, 16px padding",token:"input-bar",notes:"Glassmorphism treatment"},
        {element:"Suggestion chips",spec:"Horizontal scrollable row, surface_container_high bg, primary text, lg radius, 32px height",token:"chips-suggest",notes:"'Explain completing the square', 'Review my errors' etc."},
        {element:"Text field",spec:"surface_container_low bg, xl radius, 48px height, body-md placeholder",token:"input-field",notes:"'Type your question here...' placeholder"},
        {element:"Attach button",spec:"40px circle, on_surface_variant icon",token:"btn-attach",notes:"'+' icon — attaches photos, documents"},
        {element:"Voice button",spec:"40px circle, on_surface_variant microphone icon",token:"btn-voice",notes:"Tap-and-hold to dictate"},
        {element:"Send button",spec:"40px circle, primary bg, white arrow icon",token:"btn-send",notes:"Active when text field non-empty"},
      ]),

      pb(),

      // ════════════════ SECTION 10 — BATTLE ARENA ════════════════
      sectionBanner("10. Screen 5 — Battle Arena (Dark Mode)"),
      ...spacer(1),
      h2("10.1 Screen Purpose"),
      body("The Battle Arena is the most game-like screen in the app. It uses a dark theme (#0d1117 base) to create atmosphere and excitement. The matchmaking state shown has player avatar vs '?' opponent with a scanning animation."),
      ...spacer(1),
      h2("10.2 Layout Specifications"),
      screenTable([
        {element:"Screen bg",spec:"dark_surface (#0d1117) full screen",token:"dark-bg",notes:"Only screen in full dark mode by default"},
        {element:"Header",spec:"Back arrow (white) + 'Battle Arena' headline-md white + coin balance pill top-right",token:"battle-header",notes:"Semi-transparent surface at 20% opacity"},
        {element:"Subject chip",spec:"secondary_container (#ff9800) bg, flask icon, 'Quantum Physics' label-lg on_secondary_container text, xl radius",token:"chip-subject",notes:"Current battle subject — center aligned"},
        {element:"Player card (you)",spec:"dark_surface_low (#161b22) bg, xl radius, 160px × 160px, student avatar photo, 'YOU' badge in primary",token:"player-card",notes:"Left side of VS layout"},
        {element:"VS separator",spec:"display-md 'VS' in primary_container text, Plus Jakarta, center",token:"vs-text",notes:""},
        {element:"Opponent card",spec:"dark_surface_low bg, xl radius, 160px × 160px, '?' at 40% opacity, 'Searching...' label",token:"opponent-card",notes:"Right side — shows opponent when matched"},
        {element:"Stats row",spec:"dark_surface_low card, two columns: ENTRY FEE / WINNING PRIZE with Plus Jakarta numbers",token:"stats-row",notes:"ENTRY FEE: secondary icon + '50'. WINNING PRIZE: trophy icon + '90'"},
        {element:"Scan progress",spec:"'Scanning for expert rivals' body-sm + timer '00:14' — 8px progress bar primary fill on dark track",token:"scan-progress",notes:"Animated left-to-right fill"},
        {element:"Cancel link",spec:"'X Cancel Matchmaking' tertiary, center, on_surface_variant color",token:"btn-cancel",notes:"32px top margin from progress bar"},
      ]),

      pb(),

      // ════════════════ SECTION 11 — DIGITAL LIBRARY ════════════════
      sectionBanner("11. Screen 6 — Digital Library (Dark Mode)"),
      ...spacer(1),
      h2("11.1 Screen Purpose"),
      body("The Digital Library is a premium content discovery experience. The 'Scholar' branding and dark aesthetic creates an atmosphere of serious study. It surfaces progress, recent reads, categories, and saved notes."),
      ...spacer(1),
      h2("11.2 Layout Specifications"),
      screenTable([
        {element:"Screen bg",spec:"dark_surface (#0d1117) full screen",token:"dark-bg",notes:"Library uses dark mode for immersive reading feel"},
        {element:"Header",spec:"'The Scholar' label-lg white + search icon 24px top-right",token:"library-header",notes:"Minimal — search is key action"},
        {element:"Title block",spec:"display-md 'Digital Library' white + body-md dark muted subtitle",token:"library-title",notes:"Left-aligned, 24px top margin"},
        {element:"Search bar",spec:"dark_surface_low (#161b22) bg, xl radius, 48px height, magnifier icon, white placeholder",token:"search-bar",notes:"Full width, 16px top margin"},
        {element:"Study Tracker card",spec:"dark_surface_high (#1f2937) bg, xl radius, 'LIVE PROGRESS' chip in secondary + 'My Study Tracker' headline-md white",token:"tracker-card",notes:"'You\'ve reached 82% of your weekly goal' — 82% in primary_container color"},
        {element:"Tracker stats",spec:"Two columns: '3 Books in progress' + '45 Pages read today' — numbers in primary_container display-sm",token:"tracker-stats",notes:""},
        {element:"Recent Reads",spec:"Horizontal scroll cards 160px wide, book cover image, title below, category label body-sm muted",token:"recent-reads",notes:"'View All' link right-aligned in primary_container"},
        {element:"Subject Categories",spec:"2×2 grid, dark_surface_low bg cards xl radius, icon centered 24px primary, label body-md white",token:"category-grid",notes:"Mathematics, Science, Economics, English"},
        {element:"Bookmark card",spec:"dark_surface_low bg, xl radius, colored accent icon, title headline-sm, subject + PDF + size tags",token:"bookmark-card",notes:"Tags use dark_surface_high bg, label-sm muted text"},
        {element:"Practice card",spec:"primary bg, xl radius, title primary_container, 'Start Practice' white button",token:"practice-card",notes:"Featured mock exam card with CTA"},
      ]),

      pb(),

      // ════════════════ SECTION 12 — WALLET ════════════════
      sectionBanner("12. Screen 7 — Wallet (Dark Mode)"),
      ...spacer(1),
      h2("12.1 Screen Purpose"),
      body("The Wallet screen manages Gyan Coins — the platform's reward currency. It must communicate trust, transparency, and clarity. The glass card treatment emphasizes the premium value of coins."),
      ...spacer(1),
      h2("12.2 Layout Specifications"),
      screenTable([
        {element:"Header",spec:"Avatar + 'Luminous Academy' label-lg white + '1,240 Coins' in primary_container",token:"wallet-header",notes:"Brand name shown — supports multi-institution deployments"},
        {element:"Glass balance card",spec:"primary (#24389c) at 70% opacity, blur(20px), xl radius, full width, 140px height",token:"card-glass",notes:"'AVAILABLE BALANCE' label-sm white above balance"},
        {element:"Balance",spec:"display-sm '1,240' Plus Jakarta white + 'Gyan Coins' body-md white",token:"wallet-balance",notes:"Large prominent number with coin label below"},
        {element:"INR conversion",spec:"dark surface pill '≈ ₹1,240.00 INR' body-sm, on_surface_variant",token:"wallet-inr",notes:"Approximate real-money value"},
        {element:"Action buttons",spec:"3 buttons: REDEEM, UPGRADE, REFER — dark_surface_low bg, xl radius, 64px square, icon + label",token:"wallet-actions",notes:"Centered below glass card, 24px gap"},
        {element:"Settlement policy",spec:"Info box: secondary icon + 'Settlement Policy' + description with 70% UPI / 30% Wallet in secondary color",token:"policy-box",notes:"Critical information — always visible, never hidden"},
        {element:"Recent Activity",spec:"Section heading + 'View All' link + transaction rows",token:"activity-section",notes:"No divider lines between rows — 16px gap only"},
        {element:"Transaction row",spec:"40px icon circle (dark_surface_low) + name headline-sm + date body-sm muted + amount right",token:"tx-row",notes:"Credit: + tertiary color. Debit: - red/error color"},
      ]),

      pb(),

      // ════════════════ SECTION 13 — HOME DARK VARIANT ════════════════
      sectionBanner("13. Screen 8 — Home Dashboard (Dark Mode Variant)"),
      ...spacer(1),
      h2("13.1 Screen Purpose"),
      body("The dark home variant demonstrates the platform's full dark mode capability. All component shapes, spacing, and hierarchy are identical to the light home — only surface and text colors change. This ensures design consistency and easy theme switching."),
      ...spacer(1),
      h2("13.2 Dark Mode Mapping"),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[3000,3000,3360],
        rows:[
          new TableRow({children:[
            ...["Light Mode Token","Dark Mode Token","Component"].map((h,i)=>
              new TableCell({width:{size:[3000,3000,3360][i],type:WidthType.DXA},borders,margins:cm,
                shading:{fill:C.primary,type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]}))
          ]}),
          ...[
            ["surface (#f8f9ff)","dark_surface (#0d1117)","Screen background"],
            ["surface_container_low (#eef1fb)","dark_surface_low (#161b22)","Card backgrounds"],
            ["surface_container_high (#dce9ff)","dark_surface_high (#1f2937)","Elevated elements"],
            ["on_surface (#0d1c2e)","dark_on_surface (#e6edf3)","Primary text"],
            ["on_surface_variant (#454652)","dark_on_surf_var (#8b949e)","Secondary text"],
            ["primary (#24389c)","primary (#24389c) — unchanged","Accent, CTAs, headings"],
            ["secondary (#8b5000)","secondary (#8b5000) — unchanged","Coins, rewards"],
          ].map(([l,d,comp],i)=>new TableRow({children:[
            ...[l,d,comp].map((val,ci)=>new TableCell({width:{size:[3000,3000,3360][ci],type:WidthType.DXA},borders,margins:cm,
              shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:val,font:"Arial",size:18,color:C.onSurface})]})]}))
          ]}))
        ]
      }),
      ...spacer(1),
      infoBox("Dark Mode Rule", [
        "Primary, Secondary, and Tertiary accent colors remain IDENTICAL in both modes.",
        "Only surface colors and text colors change. This keeps brand recognition and component appearance consistent.",
        "Never add extra glow or bloom effects in dark mode — maintain the No-Line and Ambient Softness rules."
      ]),

      pb(),

      // ════════════════ SECTION 14 — NAVIGATION ════════════════
      sectionBanner("14. Navigation System"),
      ...spacer(1),
      h2("14.1 Bottom Navigation Tabs"),
      body("Both light and dark versions use the same 5-tab bottom navigation structure. The active tab uses a primary pill indicator with white icon. All tabs have labels."),
      ...spacer(1),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[1600,1600,2000,4160],
        rows:[
          new TableRow({children:[
            ...["Tab","Icon","Label","Active State"].map((h,i)=>
              new TableCell({width:{size:[1600,1600,2000,4160][i],type:WidthType.DXA},borders,margins:cm,
                shading:{fill:C.primary,type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]}))
          ]}),
          ...[
            ["1","house","Home","Primary pill bg, filled house icon white"],
            ["2","book-open","Library","Primary pill bg, filled book icon white"],
            ["3","question-square","Quiz","Primary pill bg, filled quiz icon white"],
            ["4","robot","Assistant","Primary pill bg, filled robot icon white"],
            ["5","wallet","Wallet","Primary pill bg, filled wallet icon white"],
          ].map(([t,ic,lab,state],i)=>new TableRow({children:[
            ...[t,ic,lab,state].map((val,ci)=>new TableCell({width:{size:[1600,1600,2000,4160][ci],type:WidthType.DXA},borders,margins:cm,
              shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:val,font:"Arial",size:18,
                bold:ci===0,color:ci===0?C.primary:C.onSurface})]})]}))
          ]}))
        ]
      }),
      ...spacer(1),
      h2("14.2 Navigation Transitions"),
      bullet("Screen transitions: slide from right for forward navigation, slide from left for back"),
      bullet("Tab switches: cross-fade 200ms — no slide between tabs"),
      bullet("Bottom sheet: slide up from bottom 300ms, cubic-bezier(0.4, 0, 0.2, 1)"),
      bullet("Card expand: scale from center 250ms ease-out"),

      pb(),

      // ════════════════ SECTION 15 — DOS AND DONTS ════════════════
      sectionBanner("15. Design Do's and Don'ts"),
      ...spacer(1),
      twoCol(
        [
          h3("DO"),
          divider(C.tertiary),
          bullet("Use 32px+ whitespace between major content blocks"),
          bullet("Use Plus Jakarta Sans for ALL numeric values"),
          bullet("Nest containers: surface_container_lowest on surface_container_low"),
          bullet("Use tonal shifts and whitespace to separate content sections"),
          bullet("Use xl radius (1.5rem) for buttons and lg radius (1rem) for cards"),
          bullet("Use ambient shadow only for Level 4 floating elements"),
          bullet("Test all screens in both light AND dark mode"),
          bullet("Apply glassmorphism only to nav bar and floating AI bubble"),
          bullet("Use -0.02em letter-spacing on all Plus Jakarta headlines"),
          bullet("Ensure coin/number displays use Plus Jakarta Sans"),
        ],
        [
          h3("DON'T"),
          divider("cc0000"),
          bullet("Use a 1px solid border around cards — use tonal shifts instead"),
          bullet("Use pure black (#000000) for any text — use on_surface (#0d1c2e)"),
          bullet("Use default system drop-shadows — they break the premium feel"),
          bullet("Use hard 90-degree corners on any interactive element"),
          bullet("Add a divider line between quiz answer options"),
          bullet("Apply glassmorphism to content-heavy cards"),
          bullet("Use more than 2 font families (Plus Jakarta + Inter only)"),
          bullet("Use percentage-based widths in tables — always use DXA"),
          bullet("Animate content on every scroll — reserve animation for key actions"),
          bullet("Show raw error states without a branded error illustration"),
        ]
      ),

      pb(),

      // ════════════════ SECTION 16 — DEVELOPER HANDOFF ════════════════
      sectionBanner("16. Developer Handoff Guidelines"),
      ...spacer(1),
      h2("16.1 CSS Custom Properties"),
      infoBox("Root Token Definitions", [
        "--color-primary: #24389c;",
        "--color-primary-container: #3f51b5;",
        "--color-secondary: #8b5000;",
        "--color-secondary-container: #ff9800;",
        "--color-tertiary: #004e33;",
        "--color-tertiary-fixed: #6ffbbe;",
        "--color-surface: #f8f9ff;",
        "--color-surface-low: #eef1fb;",
        "--color-surface-high: #dce9ff;",
        "--color-surface-lowest: #ffffff;",
        "--color-on-surface: #0d1c2e;",
        "--color-on-surface-variant: #454652;",
        "--color-outline-variant: #c5c5d4;",
        "--font-display: 'Plus Jakarta Sans', system-ui, sans-serif;",
        "--font-body: 'Inter', system-ui, sans-serif;",
        "--radius-lg: 1rem;  /* 16px */",
        "--radius-xl: 1.5rem;  /* 24px */",
        "--shadow-ambient: 0 12px 32px rgba(13, 28, 46, 0.06);",
      ], "f0f4ff", C.primary),
      ...spacer(1),
      h2("16.2 React Native / Expo Theme Object"),
      infoBox("StyleSheet tokens for mobile", [
        "const theme = {",
        "  colors: {",
        "    primary: '#24389c',",
        "    primaryContainer: '#3f51b5',",
        "    secondary: '#8b5000',",
        "    secondaryContainer: '#ff9800',",
        "    tertiary: '#004e33',",
        "    tertiaryFixed: '#6ffbbe',",
        "    surface: '#f8f9ff',",
        "    surfaceLow: '#eef1fb',",
        "    surfaceHigh: '#dce9ff',",
        "    surfaceLowest: '#ffffff',",
        "    onSurface: '#0d1c2e',",
        "    onSurfaceVariant: '#454652',",
        "  },",
        "  fonts: { display: 'PlusJakartaSans', body: 'Inter' },",
        "  radii: { lg: 16, xl: 24 },",
        "};",
      ], "f0f4ff", C.primary),
      ...spacer(1),
      h2("16.3 Spacing Scale"),
      new Table({
        width:{size:9360,type:WidthType.DXA}, columnWidths:[2000,2000,2000,3360],
        rows:[
          new TableRow({children:[
            ...["Token","Value","Pixels","Usage"].map((h,i)=>
              new TableCell({width:{size:[2000,2000,2000,3360][i],type:WidthType.DXA},borders,margins:cm,
                shading:{fill:C.primary,type:ShadingType.CLEAR},
                children:[new Paragraph({children:[new TextRun({text:h,font:"Arial",size:18,bold:true,color:C.white})]})]}))
          ]}),
          ...[
            ["space-1","0.25rem","4px","Icon internal padding"],
            ["space-2","0.5rem","8px","Badge padding, inline gaps"],
            ["space-3","0.75rem","12px","Card internal margin"],
            ["space-4","1rem","16px","Standard padding, row gaps"],
            ["space-6","1.5rem","24px","Card padding, section gaps"],
            ["space-8","2rem","32px","Major section whitespace"],
            ["space-12","3rem","48px","Hero section padding"],
          ].map(([t,v,p,u],i)=>new TableRow({children:[
            ...[t,v,p,u].map((val,ci)=>new TableCell({width:{size:[2000,2000,2000,3360][ci],type:WidthType.DXA},borders,margins:cm,
              shading:{fill:i%2===0?"eef1fb":"ffffff",type:ShadingType.CLEAR},
              children:[new Paragraph({children:[new TextRun({text:val,font:"Arial",size:18,
                bold:ci===0,color:ci===0?C.primary:C.onSurface})]})]}))
          ]}))
        ]
      }),
      ...spacer(1),
      h2("16.4 Accessibility Requirements"),
      bullet("All text must meet WCAG AA contrast ratio (4.5:1 for body, 3:1 for large text)"),
      bullet("All interactive elements must have ARIA labels (React Native: accessibilityLabel)"),
      bullet("Touch targets minimum 44×44 points on mobile — buttons must not be smaller"),
      bullet("Animations must respect prefers-reduced-motion — disable or reduce on system setting"),
      bullet("All images must have alt text — educational content especially"),
      bullet("Focus indicators must be visible at all times — use primary color ring"),
      ...spacer(1),
      h2("16.5 Asset Delivery"),
      bullet("Icons: Use a consistent icon library (Phosphor Icons or Material Symbols) — 24px base size, 2px stroke"),
      bullet("Illustrations: SVG format, viewBox normalized, colors using theme tokens"),
      bullet("Fonts: Self-host Plus Jakarta Sans and Inter — do not rely on CDN in production"),
      bullet("Images: WebP format, progressive loading, lazy-load below the fold"),
      bullet("App icon: 1024×1024 PNG, primary gradient background, white logo mark"),
      ...spacer(1),
      divider(C.primary),
      ...spacer(1),
      new Paragraph({ alignment:AlignmentType.CENTER, ...sp(60,40),
        children:[new TextRun({text:"Gyan Path UI/UX Design System — Version 1.0", font:"Arial", size:18, bold:true, color:C.primary})] }),
      new Paragraph({ alignment:AlignmentType.CENTER,
        children:[new TextRun({text:"April 2026  |  Confidential  |  For design and development teams only", font:"Arial", size:16, color:C.gray, italics:true})] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/claude/gyan_path_ux_spec.docx", buf);
  console.log("done");
});
