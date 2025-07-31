# How to Add a New Language

Adding a new language requires changes in multiple parts of the app.

## 1. Add Translation Strings

- File: `src/i18n/strings/<language-code>.ts`
- Copy an existing file (e.g. [English (`en.ts`)](/src/i18n/strings/en.ts)) and translate the strings.

You can find your language's code on [this Wikipedia page](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes).

You are allowed to use generative AI to get initial translation (I did so as well for Dutch), but please go over the resulting strings to verify their correctness as well as contextual appropriateness in the app. Think about what other, similar apps choose to display in your language for the same features.

> [!IMPORTANT]
> The following language files have been created (but empty) because I hope for them to be done by my friends:
> - [German](/src/i18n/strings/de.ts)
> - [Greek](/src/i18n/strings/el.ts)
> - [Spanish](/src/i18n/strings/es.ts)
> - [French](/src/i18n/strings/fr.ts)
> - [Romanian](/src/i18n/strings/ro.ts)
> - [Slovak](/src/i18n/strings/sk.ts)

> [!NOTE]
> If your language requires a different plural for quantities 2-4 than for 5+, copy from [Czech (`cs.ts`)](/src/i18n/strings/cs.ts). Keys ending in `_plural1` are then used for quantities 2-4, and `_plural2` for 5+!

## 2. Register Language in the App

**Add it to the provider**:
- File: [`src/i18n/I18nProvider.tsx`](/src/i18n/I18nProvider.tsx)
- Import the new language file and add it to the `translations` object.

**Add it to the available languages**:

- File: [`src/i18n/languages.ts`](/src/i18n/languages.ts)
- add `<language-code>: { name: "<language-native-name>" },` to the `AVAILABLE_LANGUAGES` object.

Make sure `<language-native-name>` is the **native** name of your language, to ensure the user can actually find it if they don't know English well.

> [!CAUTION]
> Do **NOT** set default to "true"!

## 3. Test It

- Run the app and switch to the new language to verify translations are loading correctly.

✅ Done!
