# ESLint & Prettier Setup

This document describes the linting and formatting configuration for the Choozify project.

## Overview

The project uses:

- **ESLint 9** with flat config format for code quality and best practices
- **Prettier** for code formatting
- **TypeScript ESLint** for TypeScript-specific rules
- **React & React Hooks** plugins for React best practices

## Configuration Files

### ESLint (`eslint.config.mjs`)

Uses the modern flat config format with:

- JavaScript recommended rules
- TypeScript strict type checking
- React and React Hooks rules
- Prettier integration (no conflicting rules)
- Browser and Node.js globals support

Key rules:

- Prefer type imports (`@typescript-eslint/consistent-type-imports`)
- No unused variables (with `_` prefix exception)
- No explicit `any` types (warning)
- Consistent code quality standards
- React hooks dependency checking

### Prettier (`.prettierrc`)

Formatting configuration:

- Single quotes for strings
- Semicolons required
- 2 space indentation
- 100 character line width
- Trailing commas (ES5)
- LF line endings

### VS Code Settings (`.vscode/settings.json`)

Automatic integration:

- Format on save with Prettier
- Auto-fix ESLint issues on save
- TypeScript workspace version

## Available Scripts

```bash
# Lint all files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are formatted (CI)
npm run format:check

# Run TypeScript type checking
npm run type-check

# Run all checks (format + lint + types)
npm run check
```

## Usage

### During Development

1. **Automatic fixing**: Save files to auto-format with Prettier and fix ESLint issues
2. **Manual formatting**: `npm run format`
3. **Manual linting**: `npm run lint:fix`

### Pre-commit / CI

Run the complete check:

```bash
npm run check
```

This will:

1. Check Prettier formatting
2. Run ESLint
3. Run TypeScript type checking

## Current Status

✅ **0 Errors** - All critical issues resolved
⚠️ **37 Warnings** - Acceptable code quality warnings:

- Unused imports (to be cleaned up as code evolves)
- `any` types (gradually being typed)
- Non-null assertions (in configuration files)
- Console statements in utility scripts

## Ignored Files

The following are automatically ignored:

- `node_modules/`
- `.next/`
- `dist/`, `build/`, `out/`
- `.vercel/`
- `.cursor/`
- `coverage/`
- `types/database.ts` (auto-generated)

See `.prettierignore` for the complete list.

## IDE Integration

### VS Code / Cursor

Install recommended extensions:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

Settings are automatically applied from `.vscode/settings.json`.

## Customization

### Adding Rules

Edit `eslint.config.mjs` to add or modify rules:

```javascript
rules: {
  'your-rule-name': 'error', // or 'warn' or 'off'
}
```

### Prettier Options

Edit `.prettierrc` to change formatting preferences.

### Ignoring Files

- **ESLint**: Add patterns to the `ignores` array in `eslint.config.mjs`
- **Prettier**: Add patterns to `.prettierignore`

## Best Practices

1. **Fix errors immediately** - Never commit code with ESLint errors
2. **Address warnings gradually** - Plan to resolve warnings over time
3. **Use type imports** - Prefer `import type` for type-only imports
4. **Avoid `any`** - Use proper TypeScript types
5. **Prefix unused vars** - Use `_` prefix for intentionally unused variables
6. **Format before commit** - Always run `npm run format` before committing

## Troubleshooting

### ESLint not working

1. Restart your IDE/editor
2. Clear ESLint cache: `rm -rf node_modules/.cache`
3. Reinstall dependencies: `npm install`

### Prettier conflicts with ESLint

The configuration already includes `eslint-config-prettier` which disables conflicting rules. If you see conflicts, ensure Prettier runs after ESLint in your IDE settings.

### TypeScript errors

Run type checking separately:

```bash
npm run type-check
```

This helps identify type issues without running the full linter.

## Resources

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React Hooks Rules](https://react.dev/reference/react/hooks#rules-of-hooks)
