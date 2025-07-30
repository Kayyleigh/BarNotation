# How to Add a New Language

Adding a new language requires changes in multiple parts of the app.

### 1. Add Translation Strings

- File: `src/i18n/strings/<language-code>.ts`
- Copy an existing file (e.g. [English (`en.ts`)](src\i18n\strings\en.ts)) and translate the strings.

> [!IMPORTANT]
> The following language files have been created (but empty) because I hope for them to be done by my friends:
> - [Czech](src\i18n\strings\cs.ts)
> - [German](src\i18n\strings\de.ts)
> - [Greek](src\i18n\strings\el.ts)
> - [Spanish](src\i18n\strings\es.ts)
> - [French](src\i18n\strings\fr.ts)
> - [Romanian](src\i18n\strings\ro.ts)
> - [Slovak](src\i18n\strings\sk.ts)

### 2. Register Language in the App

**Add it to the provider**:
- File: [`src/i18n/I18nProvider.tsx`](src\i18n\I18nProvider.tsx)
- Import the new language file and add it to the `translations` object.

**Add it to the available languages**:

- File: [`src/i18n/languages.ts`](src\i18n\languages.ts)
- add `<language-code>: { name: "<language-native-name>" },` to the `AVAILABLE_LANGUAGES` object.

Make sure `<language-native-name>` is the **native** name of your language, to ensure the user can actually find it if they don't know English well.

> [!CAUTION]
> Do **NOT** set default to "true"!

### 4. Test It

- Run the app and switch to the new language to verify translations are loading correctly.

✅ Done!
