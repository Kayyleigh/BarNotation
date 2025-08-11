// Čeština (Czech)
// Provided by Daniel M.

const cs = {
    searchbar: {
        placeholder: "Hledat...",
        tooltip: "Hledat",
        clear: "Vyčistit vyhledávání",
    },

    sortDropdown: {
        sortedBy: "Seřazeno podle",
    },

    cellRow: {
        math: "Matematický",
        text: "Text",
        hideLatex: "Skrýt výstup LateXu",
        showLatex: "Zobrazit výstup LateXu",
        latex: "LaTeX",
        loading: "Načítání odstavce...",
        // text types (match keys from TEXT_CELL_TYPES)
        section: "Sekce",
        subsection: "Pododdíl",
        subsubsection: "Podpododdíl",
        plain: "Obyčejný",
    },

    editor: {
        addMath: "Přidat matematický odstavec",
        addText: "Přidat textový odstavec",
        lockedAdd: "V zamčeném režimu nelze přidávat další odstavce",
        cleanup: "Odstranit prázdné odstavce",
        cleanupWip: "Čištení ještě není implementováno",
        clean: "Vyčistit",
        showLatex: "Zobrazit všechny LaTeXy",
        hideLatex: "Schovat všechny LaTeXy",
        enterPreview: "Vstoupit do režimu zobrazení",
        returnEdit: "Vrátit se do režimu úprav",
        preview: "Zobrazit",
        edit: "Upravit",
        lock: "Uzamknout",
        unlock: "Odemknout",
        resetZoom: "Obnovit všechny úrovně přiblížení",
        changeZoom: "Změnit výchozí úroveň přiblížení",
        defaultZoom: "Výchozí Přiblížení",
        math: "Matematický",
        text: "Textový",
        emptyMessage: "Žádné odstavce. Přidejte odstavec, abyste mohli začít!",
        lockedTooltip: "Jste v uzamčeném režimu. Odemkněte, abyste mohli pokračovat v úpravách.",
        metadata: {
            untitled: "Poznámka bez názvu",
            author: "Autor",
            date: "Datum nebo Období",
            course: "Kód Kurzu"
        },
        cell: {
            drag: "Přetáhněte odstavce pro změnu pořadí",
            duplicate: "Duplikovat odstavec",
            duplicateBtn: "Duplikovat",
            delete: "Smazat odstavec"
        },
    },

    layout: {
        mathLibraryPanel: "Matematická knihovna",
        notesMenuPanel: "Poznámky",
        notesMenu: {
            newNoteTitle: "Nová Poznámka",
            noteUnarchived: 'Poznámka "{{title}}" byla odstraněna z archivu.',
            noteDeleted: 'Poznámka "{{title}}" byla smazána.',
            noteArchived: 'Poznámka "{{title}}" byla archivována.',
        },
        sidebar: {
            show: "Zobrazit {{title}}",
            hide: "Schovat {{title}}",
            expand: "Rozbalit {{title}}",
            collapse: "Sbalit {{title}}",
        },
        header: {
            hotkeys: {
                label: "Klávesové zkratky",
                tooltip: "Zobrazit přehled klávesových zkratek",
            },
            userGuide: {
                label: "Uživatelská příručka",
                tooltip: "Otevřít uživatelskou příručku",
                toast: "Uživatelská příručka zatím není vytvořena",
            },
            settings: {
                label: "Nastavení",
                tooltip: "Přizpůsobit nastavení",
            },
        },
    },

    latex: {
        refreshPrompt: "⟲ Obnovit LaTeX",
        freshPrompt: "✓ LaTeX obnoven",
        lastRefreshed: "Poslední obnovení",
        refreshing: "Obnovuji...",
        error: "⚠ Při generování LaTeXu se vyskytla chyba",
        copy: "📋 Kopírovat",
        copied: "✔ Zkopírováno",
        never: "Nikdy"
    },

    modals: {
        close: "Uzavřít",
        archiveModal: {
            noItemsFound: "Nebyla nalezena žádná položka.",
            searchPlaceholder: "Hledat..."
        },
        hotkeysModal: {
            title: "Klávesové zkratky",
            inputShortcuts: "Vstupní zkratky",
            subscript: "Vytvořit dolní index",
            superscript: "Vytvořit horní index (exponent)",
            actuarialBL: "Aktuariálního režim (zaměření vlevo dole)",
            actuarialTL: "Aktuariálního režim (zaměření vlevo nahoře)",
            actuarialBR: "Aktuariálního režim (zaměření vpravo dole)",
            actuarialTR: "Aktuariálního režim (zaměření vpravo nahoře)",
            underset: "Umístit pod výraz",
            overset: "Umístit nad výraz",

            nthbottom: "Přidat prioritu pod (pojistněmatematická)", 
            nthtop: "Přidej prioritu nad (pojistněmatematická)", 
            
            insertMatrixRowBelow: "(V matici) Přidat řádek pod", 
            insertMatrixRowAbove: "(V matici) Přidat řádek nad", 
            insertMatrixColumnLeft: "(V matici) Přidat řádek doleva", 
            insertMatrixColumnRight: "(V matici) Přidat řádek doprava", 

            fraction: "Udělat z obsahu čitatel nové zlomku",
            structuralShortcuts: "Strukturální zkratky",
            rearrangeNodes: "Uspořádat obsah",
            editingAndNavigation: "Uprávy & Navigace",
            navigate: "Navigovat mezi obsahem",
            delete: "Smazat obsah",
            copy: "Kopírovat v podobě LaTeX",
            cut: "Vyjmout v podobě LaTeX",
            paste: "Vložit v podobě LaTeX",
            undo: "Vrátit zpět",
            redo: "Znovu",
            viewControls: "Ovládání zobrazení",
            zoomIn: "Přiblížit",
            zoomOut: "Oddálit",
            zoomReset: "Resetovat přiblížení",
        },
        collectionArchive: {
            title: "Archivované Sbírky",
            searchPlaceholder: "Hledat archivované sbírky...",
            searchTooltip: "Hledat sbírky podle názvu",
            noMatching: "Nebyla nalezena žádná odpovídající sbírka.",
            noEntries: "Žádné výrazy.",
            entry: "výraz",
            entries: "výrazů",
            preview: "Náhled",
            hide: "Skrýt",
            restore: "Obnovit",
            restoreTooltip: "Obnovit sbírku",
            deleteTooltip: "Trvale smazat sbírku",
            deleteConfirm: "Opravdu chcete trvale smazat sbírku",
            archivedAt: "Archivováno dne",
            createdAt: "Vytvořeno dne",
            tooltip: {
                noEntries: "Ve sbírce nejsou žádné výrazy",
                hide: "Skrýt výrazy",
                view: "Zobrazit výrazy ve sbírce",
            },
            sort: {
                archived_desc: "Nedávno Archivováno",
                archived_asc: "Nejdéle Archivováno",
                created_desc: "Nejnovější Sbírka",
                created_asc: "Nejstarší Sbírka",
                name_desc: "A → Z",
                name_asc: "Z → A",
                entryCount_desc: "Nejvíce Výrazů",
                entryCount_asc: "Nejméně Výrazů",
            },
        },
        notebookArchive: {
            title: "Archivované Sešity",
            searchPlaceholder: "Prohledat archivované sešity...",
            searchTooltip: "Hledat podle názvu, kódu kurzu nebo autora",
            noMatches: "Nebyly nalezeny žádné odpovídající sešity.",
            restore: "Obnovit",
            restoreTooltip: "Obnovit sešit",
            deleteTooltip: "Trvale smazat",
            confirmDelete: `Opravdu chcete trvale smazat "{{title}}" ?`,
            archivedAt: "Archivováno dne {{date}}",
            createdAt: "Vytvořeno dne {{date}}",
            by: "Od",
            cell: "odstavec",
            cell_plural1: "odstavce",  // 2-4
            cell_plural2: "odstavců",  // 0, 5+
            sort: {
                recentlyArchived: "Nedávno Archivováno",
                longestArchived: "Nejdéle Archivováno",
                newestCreated: "Nejnovější",
                oldestCreated: "Nejstarší",
                mostCells: "Nejvíce Odstavců",
                leastCells: "Nejméně Odstavců",
                titleAZ: "A → Z",
                titleZA: "Z → A",
            },
        },
        settings: {
            title: "Nastavení",
            theme: "Přizpůsobení",
            themeTooltip: "Zvolit režim",
            light: "Světlý režim",
            dark: "Tmavý režim",
            showColor: "Barvy v režimu zobrazení",
            showColorTooltip: "Zobrazit/Skrýt použití barev v režimu zobrazení",
            defaultAuthor: "Výchozí Jméno Autora",
            authorPlaceholder: "Vaše jméno",
            nerdMode: "Jsem nerd",
            nerdTooltip: "Zobrazit/Skrýt počet přetahnutí",
            language: "Jazyk",
        },
        exportLatex: {
            title: "Exportovat do LaTeXu",
            formatLabel: "Formát",
            format: {
                single: "Jednoduchý sloupec",
                double: "Dvojitý sloupec",
            },
            wrapEquations: "Obalit matematické výrazy do rovnic",
            download: "Stáhnout",
            downloadTooltip: "Stáhnout .tex soubor",
        },
    },

    notesMenu: {
        createTooltip: "Vytvořit nový sešit",
        newNote: "Nová Poznámka",
        archiveTooltip: "Zobrazit archivované sešity",
        archived: "Archivováno",
        searchPlaceholder: "Hledat poznámky...",
        searchTooltip: "Hledat poznámky podle nadpisu",
        notesSection: "Poznámky",
        sort: {
            modified: "Naposledy Upraveno",
            created: "Datum Vytvoření",
            title: "A → Z",
            cellCount: "Počet Odstavců",
        },
        noNotes: "Nebyly nalezeny žádné poznámky.",
        noteOptions: "Nastavení Poznámky",
        actions: {
            archive: "Archivovat",
            duplicate: "Duplikovat",
            exportLatex: "Exportovat do LaTeXu",
            delete: "Smazat",
        }
    },

    mathLibrary: {
        entries: {
            deleteEntry: "Smazat výraz",
            empty: "Přetáhněte sem matematický výraz",
            noMatches: "Nebyly nalezeny žádné odpovídající výrazy.",
            ariaLabel: "Výrazy ve sbírce {{name}}",
        },
        error: {
            loadStorage: "Při načítání sbírek došlo k chybě.",
            saveStorage: "Při ukládání sbírek došlo k chybě.",
            parseLatex: "Při analýze LaTeXu došlo k chybě.",
        },
        success: {
            addLatex: "LaTeX byl přidán do knihovny.",
            entryMoved: "Výraz byl přesunut mezi sbírkami.",
            entryAddedTo: `Výraz {{latex}} byl přidán do {{collection}}.`,
            unarchived: `Výraz "{{name}}" byl obnoven.`,
            deleted: `Výraz "{{name}}" byl smazán.`,
        },
        warning: {
            entryExists: "Výraz již existuje ve sbírce.",
            entryExistsIn: `Výraz {{latex}} již existuje v {{collection}}.`,
        },
        search: {
            placeholder: "Hledat ve sbírce...",
            placeholderWith: "Prohledat {{name}}...",
            tooltip: "Hledat podle podřetězce LaTeXu",
        },
        sort: {
            newest: "Nejnovější",
            oldest: "Nejstarší",
            mostUsed: "Nejvíce Používané",
            leastUsed: "Nejméně Používané",
            aZ: "A → Z",
            zA: "Z → A",
            ariaLabel: "Třídit výrazy v knihovně",
        },
        loading: "Náčítám sbírky, tato akce může chvíli trvat...",
        empty: "Žádná aktivní sbírka není k dispozici.",
        default: {
            collection: "Sbírka",
        },
        tabs: {
            defaultName: "Moje Sbírka",
            tooltip: {
                new: "Nová Sbírka",
                archive: "Archiv Sbírek",
                moreOptions: "Další možnosti",
            },
            toast: {
                duplicated: `Sbírka "{{name}}" byla duplikována`,
                deleted: `Sbírka "{{name}}" byla smazána`,
                archived: `Sbírka "{{name}}" byla archivována`,
            },
            confirm: {
                delete: "Jste si jisti, že chcete smazat tuto sbírku?",
            },
        },
        tabMenu: {
            rename: "Přejmenovat",
            renameTooltip: "Přejmenovat sbírku",
            duplicate: "Duplikovat",
            duplicateTooltip: "Duplikovat sbírku",
            archive: "Archivovat",
            archiveTooltip: "Přesunout do archivu",
            delete: "Smazat",
            deleteTooltip: "Trvale smazat",
        },
    },
    date: {
        created: "Vytvořeno",
        edited: "Upraveno",
        archived: "Archivováno",
        justNow: "právě teď",
        minuteAgo: "{{count}} minuta zpět",
        minuteAgo_plural1: "{{count}} minuty zpět",  // 2–4
        minuteAgo_plural2: "{{count}} minut zpět",   // 0, 5+
        hourAgo: "{{count}} hodina zpět",
        hourAgo_plural1: "{{count}} hodiny zpět",  // 2–4
        hourAgo_plural2: "{{count}} hodin zpět",   // 0, 5+
        yesterday: "včera",
    },

    premadeCollections: {
        "premade-structures": "🏗️ Struktury",
        "premade-calculus": "Kalkulus",
        "premade-logic": "Logika",
        "premade-probability": "Pravděpodobnost a statistika",
        "greek-letters": "Řecká písmena",
        "premade-actuarial": "Pojistně-matematický",
        "premade-linalg": "Lineární Algebra", 
    }
};

export default cs;
