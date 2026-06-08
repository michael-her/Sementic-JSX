#!/usr/bin/env node
/**
 * sjsx - Semantic JSX CLI
 * Usage:
 *   sjsx scaffold <file.sjsx>          → 구현 scaffold 생성
 *   sjsx diff <file.sjsx>              → 합의 미완료 항목 출력
 *   sjsx status <dir>                  → 디렉토리 내 sjsx 합의 현황
 */

import fs from "fs";
import path from "path";

const [,, cmd, target] = process.argv;

// ─── Parsers ──────────────────────────────────────────────────────────────────

function extractMeta(src) {
  const metaMatch = src.match(/@sjsx([\s\S]*?)\*\//);
  if (!metaMatch) return {};
  const block = metaMatch[1];
  const get = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : null;
  };
  return {
    domain: get("domain"),
    layer:  get("layer"),
    status: get("status"),
  };
}

function extractTodos(src) {
  const agreed   = [...src.matchAll(/\[x\]\s*(.+)/g)].map(m => m[1].trim());
  const pending  = [...src.matchAll(/\[ \]\s*(.+)/g)].map(m => m[1].trim());
  return { agreed, pending };
}

function extractComponents(src) {
  const tags = [...src.matchAll(/<([A-Z][A-Za-z]+)/g)].map(m => m[1]);
  return [...new Set(tags)];
}

function extractStore(src) {
  const storeMatch = src.match(/<Store\s([\s\S]*?)\/>/);
  if (!storeMatch) return null;
  return storeMatch[0];
}

function detectLayer(src) {
  if (src.includes("ThreadPool") || src.includes("DbJob")) return "system";
  if (src.includes("View") || src.includes("TouchableOpacity")) return "ui";
  return "unknown";
}

// ─── Scaffold Generators ──────────────────────────────────────────────────────

function scaffoldSystem(meta, components, src) {
  const lines = [];
  lines.push(`// AUTO-SCAFFOLDED from ${path.basename(target)}`);
  lines.push(`// domain: ${meta.domain} | layer: system\n`);
  lines.push(`import { ThreadPool, DbJob } from "@sjsx/runtime";\n`);

  if (src.includes("Store")) {
    lines.push(`// ─── Store ───────────────────────────────────────────────`);
    lines.push(`// TODO: implement Redux store from todo-system.sjsx Store definition`);
    lines.push(`export const ${meta.domain}Store = createStore(rootReducer);\n`);
  }

  if (src.includes("ThreadPool")) {
    lines.push(`// ─── Workers ─────────────────────────────────────────────`);
    const workerNames = [...src.matchAll(/const (\w+Worker)\s*=/g)].map(m => m[1]);
    workerNames.forEach(name => {
      lines.push(`export function start${name}() {`);
      lines.push(`  // TODO: implement from .sjsx definition`);
      lines.push(`  const pool = new ThreadPool({ threads: 4, cancelFlag: true });`);
      lines.push(`  // ...\n}`);
    });
  }

  return lines.join("\n");
}

function scaffoldUI(meta, components, src) {
  const lines = [];
  lines.push(`// AUTO-SCAFFOLDED from ${path.basename(target)}`);
  lines.push(`// domain: ${meta.domain} | layer: ui\n`);
  lines.push(`import React from "react";`);
  lines.push(`import { View, Text, FlatList, TouchableOpacity } from "react-native";`);
  lines.push(`import { connect } from "react-redux";`);
  lines.push(`import { ${meta.domain}Store } from "./${meta.domain?.toLowerCase()}-system";\n`);

  const subComponents = components.filter(c =>
    !["View","Text","FlatList","TouchableOpacity","Connect","Store","Checkbox","FlatList"].includes(c)
  );

  subComponents.forEach(name => {
    lines.push(`// ─── ${name} ${"─".repeat(Math.max(0, 50 - name.length))}`);
    lines.push(`function ${name}(props) {`);
    lines.push(`  // TODO: implement from .sjsx definition`);
    lines.push(`  return null;`);
    lines.push(`}\n`);
  });

  return lines.join("\n");
}

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdScaffold() {
  if (!target || !fs.existsSync(target)) {
    console.error(`❌  File not found: ${target}`);
    process.exit(1);
  }

  const src    = fs.readFileSync(target, "utf-8");
  const meta   = extractMeta(src);
  const layer  = meta.layer || detectLayer(src);
  const comps  = extractComponents(src);
  const todos  = extractTodos(src);

  console.log(`\n📄  ${path.basename(target)}`);
  console.log(`    domain : ${meta.domain ?? "unknown"}`);
  console.log(`    layer  : ${layer}`);
  console.log(`    status : ${meta.status ?? "unknown"}`);

  if (todos.pending.length > 0) {
    console.log(`\n⚠️   미합의 항목 (${todos.pending.length}개) — scaffold는 생성되나 TODO로 마킹됨:`);
    todos.pending.forEach(t => console.log(`    [ ] ${t}`));
  }

  const outName  = target.replace(".sjsx", `.scaffold.ts`);
  const scaffold = layer === "system"
    ? scaffoldSystem(meta, comps, src)
    : scaffoldUI(meta, comps, src);

  fs.writeFileSync(outName, scaffold);
  console.log(`\n✅  Scaffold 생성: ${outName}\n`);
}

function cmdDiff() {
  if (!target || !fs.existsSync(target)) {
    console.error(`❌  File not found: ${target}`);
    process.exit(1);
  }

  const src   = fs.readFileSync(target, "utf-8");
  const todos = extractTodos(src);
  const meta  = extractMeta(src);

  console.log(`\n📄  ${path.basename(target)} (${meta.domain} / ${meta.layer})`);
  console.log(`\n✅  합의 완료 (${todos.agreed.length}개):`);
  todos.agreed.forEach(t => console.log(`    [x] ${t}`));
  console.log(`\n⏳  합의 필요 (${todos.pending.length}개):`);
  todos.pending.forEach(t => console.log(`    [ ] ${t}`));
  console.log();
}

function cmdStatus() {
  const dir = target || ".";
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sjsx"));

  if (files.length === 0) {
    console.log(`\n  .sjsx 파일 없음: ${dir}\n`);
    return;
  }

  console.log(`\n📁  ${dir}\n`);
  files.forEach(f => {
    const src    = fs.readFileSync(path.join(dir, f), "utf-8");
    const meta   = extractMeta(src);
    const todos  = extractTodos(src);
    const agreed = todos.agreed.length;
    const total  = agreed + todos.pending.length;
    const pct    = total ? Math.round(agreed / total * 100) : 100;
    const bar    = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));

    console.log(`  ${f.padEnd(30)} ${bar} ${pct}%  (${agreed}/${total})`);
  });
  console.log();
}

// ─── Run ──────────────────────────────────────────────────────────────────────

switch (cmd) {
  case "scaffold": cmdScaffold(); break;
  case "diff":     cmdDiff();     break;
  case "status":   cmdStatus();   break;
  default:
    console.log(`
sjsx — Semantic JSX CLI

Commands:
  sjsx scaffold <file.sjsx>   구현 scaffold 생성
  sjsx diff     <file.sjsx>   합의 미완료 항목 출력
  sjsx status   [dir]         디렉토리 합의 현황
`);
}
