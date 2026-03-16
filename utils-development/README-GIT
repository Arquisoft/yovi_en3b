# 📘 Guía de Git para el equipo — yovi_en3b
# 📘 Git Guide for the team — yovi_en3b

---

## Tabla de contenidos / Table of Contents

### Castellano
1. [Configuración inicial (solo una vez)](#1--configuración-inicial-solo-una-vez)
2. [Antes de empezar a programar](#2--antes-de-empezar-a-programar)
3. [Estructura de ramas del repositorio](#3--estructura-de-ramas-del-repositorio)
4. [Flujo habitual: commit y push](#4--flujo-habitual-commit-y-push)
5. [Git Stash: guardar cambios temporalmente](#5--git-stash-guardar-cambios-temporalmente)
6. [Recuperarse de errores](#6--recuperarse-de-errores)
   - [6.1 Hice un commit sin querer (aún NO hice push)](#61-hice-un-commit-sin-querer-aún-no-hice-push)
   - [6.2 Hice un commit sin querer (ya hice push)](#62-hice-un-commit-sin-querer-ya-hice-push)
   - [6.3 ¿Qué son los "not staged changes"?](#63-qué-son-los-not-staged-changes)
   - [6.4 Machacar tu rama local con otra rama](#64-machacar-tu-rama-local-con-otra-rama)
   - [6.5 Tengo conflictos de merge](#65-tengo-conflictos-de-merge)
   - [6.6 Quiero descartar todos mis cambios locales (sin commitear)](#66-quiero-descartar-todos-mis-cambios-locales-sin-commitear)
   - [6.7 Hice push a la rama equivocada](#67-hice-push-a-la-rama-equivocada)
   - [6.8 Añadí archivos al staging sin querer](#68-añadí-archivos-al-staging-sin-querer)
7. [Resumen rápido de comandos](#7--resumen-rápido-de-comandos)

### English
1. [Initial Setup (only once)](#1--initial-setup-only-once)
2. [Before you start coding](#2--before-you-start-coding)
3. [Repository branch structure](#3--repository-branch-structure)
4. [Regular workflow: commit and push](#4--regular-workflow-commit-and-push)
5. [Git Stash: temporarily saving changes](#5--git-stash-temporarily-saving-changes)
6. [Recovering from errors](#6--recovering-from-errors)
   - [6.1 I made a commit by mistake (I have NOT pushed yet)](#61-i-made-a-commit-by-mistake-i-have-not-pushed-yet)
   - [6.2 I made a commit by mistake (I already pushed)](#62-i-made-a-commit-by-mistake-i-already-pushed)
   - [6.3 What are "not staged changes"?](#63-what-are-not-staged-changes)
   - [6.4 Overwrite your local branch with another branch](#64-overwrite-your-local-branch-with-another-branch)
   - [6.5 I have merge conflicts](#65-i-have-merge-conflicts)
   - [6.6 I want to discard all my local changes (uncommitted)](#66-i-want-to-discard-all-my-local-changes-uncommitted)
   - [6.7 I pushed to the wrong branch](#67-i-pushed-to-the-wrong-branch)
   - [6.8 I added files to staging by mistake](#68-i-added-files-to-staging-by-mistake)
7. [Quick command reference](#7--quick-command-reference)

---

# Castellano

---

## 1. 🔧 Configuración inicial (solo una vez)

Si **no tienes el repositorio en tu máquina local**, clónalo:

```bash
git clone https://github.com/Arquisoft/yovi_en3b.git
```

Esto creará una carpeta `yovi_en3b` con todo el contenido del repositorio. Entra en ella:

```bash
cd yovi_en3b
```

> ⚠️ **Esto solo se hace UNA VEZ.** Una vez clonado, no necesitas volver a hacerlo.

---

## 2. 🚀 Antes de empezar a programar

**SIEMPRE**, antes de escribir una sola línea de código, asegúrate de tener la última versión del código. Hay dos comandos clave:

### `git fetch`

```bash
git fetch origin
```

- **Descarga** la información más reciente del repositorio remoto (nuevas ramas, commits, etc.).
- **NO modifica** tu código local. Solo actualiza las referencias remotas.
- Es como "mirar el buzón sin abrir las cartas". 📬

### `git pull`

```bash
git pull origin <nombre-de-rama>
```

Ejemplo:

```bash
git pull origin develop
```

- **Descarga Y fusiona** los cambios remotos en tu rama local.
- Es como "mirar el buzón, abrir las cartas y guardarlas". 📬📖
- Equivale a hacer `git fetch` + `git merge`.

### ¿Qué hacer entonces?

```bash
# 1. Asegúrate de estar en tu rama
git checkout tu-rama

# 2. Trae los últimos cambios de tu rama (o de develop si quieres estar al día)
git pull origin tu-rama
# o
git pull origin develop
```

> 💡 **Consejo:** Haz `git pull` siempre antes de empezar a trabajar para evitar conflictos innecesarios.

---

## 3. 🌿 Estructura de ramas del repositorio

Nuestro repositorio tiene las siguientes ramas con estos propósitos:

### Ramas principales

| Rama          | Propósito                                                                                     |
|---------------|-----------------------------------------------------------------------------------------------|
| `master`      | 🔒 Rama principal y estable. Solo se sube código **probado y funcional** desde `develop`.      |
| `develop`     | 🔄 Rama de integración. Aquí volcamos el trabajo conjunto (back + front) antes de ir a master. |
| `front-end`   | 🎨 Rama dedicada al desarrollo del **frontend**.                                               |
| `back-end`    | ⚙️ Rama dedicada al desarrollo del **backend**.                                                |
| `gh-pages`    | 📄 Rama **exclusivamente** para la documentación del proyecto.                                 |

### Ramas personales (por miembro del equipo)

Cada miembro del equipo tiene su propia rama de trabajo:

| Rama                      | Miembro                          |
|---------------------------|----------------------------------|
| `lucas`                   | Lucas                            |
| `ceyda`                   | Ceyda                            |
| `marcos`                  | Marcos                           |
| `david`                   | David                            |
| `elena`                   | Elena                            |
| `luisspo`                 | Luisspo                          |
| `elena-test-tobedeleted`  | Elena (rama de testing temporal) |

### Flujo de trabajo recomendado

```
tu-rama-personal ──► develop ──► master
                        ▲
front-end ──────────────┘
back-end ───────────────┘
```

1. Trabajas en **tu rama personal** o en `front-end`/`back-end`.
2. Cuando tu trabajo esté listo, haces una **Pull Request (PR) a `develop`**.
3. Cuando `develop` esté **estable y probada**, se mergea a `master`.

> ⚠️ **NUNCA trabajes directamente sobre `master`.**

> 🔒 **IMPORTANTE: Cualquier merge a `develop` DEBE hacerse a través de una Pull Request (PR).**
> NO hagas merge directamente a `develop` desde la línea de comandos. Siempre crea una PR
> en GitHub para que el equipo pueda revisar los cambios antes de integrarlos.

### Cómo crear una Pull Request (PR)

1. Sube tus cambios a tu rama:
   ```bash
   git push origin tu-rama
   ```
2. Ve al repositorio en GitHub: https://github.com/Arquisoft/yovi_en3b
3. Verás un banner sugiriendo crear una PR. Haz clic en **"Compare & pull request"**.
4. Configura la **rama base** como `develop` y la **rama de comparación** como tu rama.
5. Añade un título descriptivo y una descripción de tus cambios.
6. Haz clic en **"Create pull request"**.
7. Espera a que al menos un miembro del equipo **revise y apruebe** la PR.
8. Una vez aprobada, haz clic en **"Merge pull request"**.

---

## 4. 📝 Flujo habitual: commit y push

### Paso a paso

```bash
# 1. Comprueba en qué rama estás
git branch

# 2. Asegúrate de estar en tu rama
git checkout tu-rama

# 3. Trae los últimos cambios
git pull origin tu-rama

# 4. (Trabaja en tu código... ✍️)

# 5. Revisa qué archivos has modificado
git status

# 6. Añade los archivos al staging area
git add .                    # Añade TODOS los archivos modificados
# o
git add archivo1.js archivo2.js  # Añade archivos específicos

# 7. Haz el commit con un mensaje descriptivo
git commit -m "feat: añadida funcionalidad de login"

# 8. Sube los cambios al repositorio remoto
git push origin tu-rama
```

**Nota:** El "Paso a paso" anterior describe el flujo cuando trabajas en tu rama personal con tus propias funcionalidades. Si vas a compartir la implementación o trabajar en una funcionalidad junto a otros compañeros (por ejemplo, una funcionalidad conjunta de front-end o back-end), crea una rama de colaboración (por ejemplo `feature/nombre`) y trabaja localmente en tu rama personal; luego sube (push) y abre una Pull Request hacia la rama de colaboración o hacia `develop` según corresponda para integrar el trabajo conjunto. En cualquier caso, todos deberíamos trabajar primero en nuestra propia rama personal y **no** directamente en `front-end` ni `back-end`: esas ramas son temporales dependientes de eliminación cuando termine su ciclo de implementación.


### ¿Qué implica cada paso?

| Comando      | ¿Qué hace?                                                                 |
|--------------|-----------------------------------------------------------------------------|
| `git status` | Muestra los archivos modificados, añadidos o eliminados.                    |
| `git add`    | Mueve los cambios al **staging area** (los "prepara" para el commit).       |
| `git commit` | Crea una **"foto"** de tus cambios en el historial local.                   |
| `git push`   | **Sube** tus commits locales al repositorio remoto en GitHub.               |

### Visualización del flujo

```
Archivos modificados ──► git add ──► Staging Area ──► git commit ──► Historial local ──► git push ──► GitHub
```

### Buenos mensajes de commit

Usa un formato consistente:

```
feat: nueva funcionalidad
fix: corrección de un bug
docs: cambios en documentación
style: cambios de formato (no afectan lógica)
refactor: reestructuración de código
test: añadir o modificar tests
```

Ejemplo:

```bash
git commit -m "feat: añadido endpoint para obtener usuarios"
git commit -m "fix: corregido error en el login cuando la contraseña está vacía"
```

---

## 5. 📦 Git Stash: guardar cambios temporalmente

### ¿Qué es?

El **stash** es como una **"caja temporal"** donde guardas cambios que aún no quieres commitear, pero tampoco quieres perder.

### ¿Cuándo se usa?

- Necesitas **cambiar de rama** pero tienes cambios sin commitear.
- Quieres **limpiar tu directorio de trabajo** temporalmente.
- Alguien te pide ayuda en otra rama y no quieres perder lo que llevas hecho.

### Comandos principales

```bash
# Guardar cambios en el stash
git stash

# Guardar con un mensaje descriptivo
git stash save "cambios en el formulario de login"

# Ver la lista de stashes guardados
git stash list

# Recuperar los cambios del último stash (y eliminarlo de la lista)
git stash pop

# Recuperar los cambios del último stash (sin eliminarlo de la lista)
git stash apply

# Recuperar un stash específico
git stash apply stash@{1}

# Eliminar un stash específico
git stash drop stash@{0}

# Eliminar TODOS los stashes
git stash clear
```

### Ejemplo práctico: cambiar de rama sin perder cambios

```bash
# 1. Estás en tu rama trabajando y tienes cambios sin commitear
git status  # Ves archivos modificados

# 2. Necesitas ir a otra rama urgentemente → guarda tus cambios
git stash save "WIP: formulario a medias"

# 3. Tu directorio ahora está limpio, puedes cambiar de rama
git checkout otra-rama

# 4. Haces lo que necesitas en la otra rama...

# 5. Vuelves a tu rama
git checkout tu-rama

# 6. Recuperas tus cambios
git stash pop
```

### Diagrama visual

```
Tu código con cambios ──► git stash ──► Cambios guardados en la "caja" 📦
                                              │
Haces lo que necesitas...                     │
                                              │
Tu código limpio ◄──── git stash pop ◄────────┘
```

---

## 6. 🚨 Recuperarse de errores

### 6.1 Hice un commit sin querer (aún NO hice push)

#### Opción A: Deshacer el commit pero mantener los cambios

```bash
git reset --soft HEAD~1
```

- Deshace el último commit.
- Tus cambios **vuelven al staging area** (como si acabaras de hacer `git add`).

#### Opción B: Deshacer el commit y quitar los cambios del staging

```bash
git reset HEAD~1
```

- Deshace el último commit.
- Tus cambios **vuelven al directorio de trabajo** (como si no hubieras hecho `git add`).

#### Opción C: Deshacer el commit y ELIMINAR los cambios

```bash
git reset --hard HEAD~1
```

> ⚠️ **CUIDADO:** Esto **elimina permanentemente** los cambios del último commit.

### 6.2 Hice un commit sin querer (ya hice push)

Si ya subiste el commit al remoto y necesitas deshacerlo:

```bash
# Crea un nuevo commit que "revierte" los cambios del commit anterior
git revert HEAD
git push origin tu-rama
```

> 💡 `git revert` es más seguro que `git reset` cuando ya has hecho push, porque no reescribe el historial.

### 6.3 ¿Qué son los "not staged changes"?

Cuando haces `git status`, puedes ver algo como:

```
Changes not staged for commit:
    modified:   archivo1.js
    modified:   archivo2.js
```

Esto significa que has **modificado archivos** pero **no los has añadido al staging area** con `git add`. Git los ve como cambios pero no los incluirá en el próximo commit.

```
Directorio de trabajo        Staging Area           Repositorio
(not staged)           ──►   (staged/added)   ──►   (committed)
                       git add               git commit
```

**Solución:** Simplemente haz `git add` para los archivos que quieras commitear:

```bash
git add archivo1.js
# o para añadir todo:
git add .
```

### 6.4 Machacar tu rama local con otra rama

Si quieres **sobrescribir** completamente tu rama local con el contenido de otra rama:

```bash
# 1. Asegúrate de estar en tu rama
git checkout tu-rama

# 2. Trae los últimos cambios del remoto
git fetch origin

# 3. Machaca tu rama con la otra
git reset --hard origin/otra-rama
```

Ejemplo: machacar tu rama con `develop`:

```bash
git checkout tu-rama
git fetch origin
git reset --hard origin/develop
```

Si necesitas subir esto al remoto:

```bash
git push --force
```

> ⚠️ **CUIDADO:** `--force` sobrescribe el historial remoto. Usa con precaución.

### 6.5 Tengo conflictos de merge

Cuando haces `git pull` o `git merge` y hay conflictos:

```bash
# 1. Git te avisará de los archivos con conflictos
git status

# 2. Abre los archivos con conflictos. Verás algo como:
<<<<<<< HEAD
tu código
=======
código de la otra rama
>>>>>>> otra-rama

# 3. Edita el archivo y quédate con el código correcto
#    (elimina los marcadores <<<, ===, >>>)

# 4. Añade los archivos resueltos
git add archivo-resuelto.js

# 5. Completa el merge
git commit -m "fix: resuelto conflicto en archivo-resuelto.js"
```

### 6.6 Quiero descartar todos mis cambios locales (sin commitear)

```bash
# Descartar cambios en un archivo específico
git checkout -- archivo.js

# Descartar TODOS los cambios locales
git checkout -- .

# Si también quieres eliminar archivos nuevos (no trackeados)
git clean -fd
```

### 6.7 Hice push a la rama equivocada

```bash
# 1. Ve a la rama equivocada y deshaz el commit
git checkout rama-equivocada
git reset --hard HEAD~1
git push --force origin rama-equivocada

# 2. Ve a la rama correcta y aplica los cambios
git checkout rama-correcta
git cherry-pick <hash-del-commit>
git push origin rama-correcta
```

> 💡 Puedes obtener el hash del commit con `git log --oneline`.

### 6.8 Añadí archivos al staging sin querer

```bash
# Quitar un archivo del staging (pero mantener los cambios)
git reset HEAD archivo.js

# Quitar TODOS los archivos del staging
git reset HEAD
```

---

## 7. 📋 Resumen rápido de comandos

| Acción                                       | Comando                                     |
|----------------------------------------------|---------------------------------------------|
| Clonar el repo (solo 1 vez)                  | `git clone https://github.com/Arquisoft/yovi_en3b.git` |
| Ver en qué rama estás                        | `git branch`                                |
| Cambiar de rama                              | `git checkout nombre-rama`                  |
| Crear y cambiar a nueva rama                 | `git checkout -b nueva-rama`                |
| Traer info del remoto (sin modificar local)  | `git fetch origin`                          |
| Traer y fusionar cambios                     | `git pull origin nombre-rama`               |
| Ver archivos modificados                     | `git status`                                |
| Añadir archivos al staging                   | `git add .` o `git add archivo`             |
| Hacer commit                                 | `git commit -m "mensaje"`                   |
| Subir cambios al remoto                      | `git push origin nombre-rama`               |
| Guardar cambios temporalmente                | `git stash`                                 |
| Recuperar cambios del stash                  | `git stash pop`                             |
| Deshacer último commit (sin push)            | `git reset --soft HEAD~1`                   |
| Machacar rama local con otra                 | `git reset --hard origin/otra-rama`         |
| Descartar cambios locales                    | `git checkout -- .`                         |
| Ver historial de commits                     | `git log --oneline`                         |
| Forzar push (sobrescribir remoto)            | `git push --force`                          |

---

> 📌 **Recuerda:** Ante la duda, `git status` y `git log --oneline` son tus mejores amigos para saber en qué estado estás.

> 🤝 **Flujo seguro:** `pull → código → add → commit → push → Pull Request a develop`

> ⚠️ **Nunca trabajes directamente sobre `master`.**

> 🔒 **Cualquier merge a `develop` debe hacerse a través de una Pull Request (PR) en GitHub.**

---
---
---

# 🇬🇧 ENGLISH

---

## 1. 🔧 Initial Setup (only once)

If you **don't have the repository on your local machine**, clone it:

```bash
git clone https://github.com/Arquisoft/yovi_en3b.git
```

This will create a folder called `yovi_en3b` with all the repository contents. Navigate into it:

```bash
cd yovi_en3b
```

> ⚠️ **This is done ONLY ONCE.** Once cloned, you don't need to do it again.

---

## 2. 🚀 Before you start coding

**ALWAYS**, before writing a single line of code, make sure you have the latest version of the code. There are two key commands:

### `git fetch`

```bash
git fetch origin
```

- **Downloads** the latest information from the remote repository (new branches, commits, etc.).
- **Does NOT modify** your local code. It only updates remote references.
- Think of it as "checking the mailbox without opening the letters". 📬

### `git pull`

```bash
git pull origin <branch-name>
```

Example:

```bash
git pull origin develop
```

- **Downloads AND merges** the remote changes into your local branch.
- Think of it as "checking the mailbox, opening the letters and filing them away". 📬📖
- It's equivalent to running `git fetch` + `git merge`.

### So, what should you do?

```bash
# 1. Make sure you're on your branch
git checkout your-branch

# 2. Pull the latest changes from your branch (or from develop to stay up to date)
git pull origin your-branch
# or
git pull origin develop
```

> 💡 **Tip:** Always run `git pull` before starting to work to avoid unnecessary conflicts.

---

## 3. 🌿 Repository branch structure

Our repository has the following branches with these purposes:

### Main branches

| Branch       | Purpose                                                                                                |
|--------------|--------------------------------------------------------------------------------------------------------|
| `master`     | 🔒 Main and stable branch. Only **tested and working** code is pushed here from `develop`.              |
| `develop`    | 🔄 Integration branch. We merge our joint work (back + front) here before moving it to master.          |
| `front-end`  | 🎨 Branch dedicated to **frontend** development.                                                        |
| `back-end`   | ⚙️ Branch dedicated to **backend** development.                                                         |
| `gh-pages`   | 📄 Branch **exclusively** for project documentation.                                                    |

### Personal branches (per team member)

Each team member has their own working branch:

| Branch                    | Member                           |
|---------------------------|----------------------------------|
| `lucas`                   | Lucas                            |
| `ceyda`                   | Ceyda                            |
| `marcos`                  | Marcos                           |
| `david`                   | David                            |
| `elena`                   | Elena                            |
| `luisspo`                 | Luisspo                          |
| `elena-test-tobedeleted`  | Elena (temporary testing branch) |

### Recommended workflow

```
your-personal-branch ──► develop ──► master
                            ▲
front-end ──────────────────┘
back-end ────────────────────┘
```

1. You work on **your personal branch** or on `front-end`/`back-end`.
2. When your work is ready, you open a **Pull Request (PR) to `develop`**.
3. When `develop` is **stable and tested**, it gets merged into `master`.

> ⚠️ **NEVER work directly on `master`.**

> 🔒 **IMPORTANT: Any merge to `develop` MUST be done through a Pull Request (PR).**
> Do NOT merge directly into `develop` from the command line. Always create a PR
> on GitHub so that the team can review the changes before they are integrated.

### How to create a Pull Request (PR)

1. Push your changes to your branch:
   ```bash
   git push origin your-branch
   ```
2. Go to the repository on GitHub: https://github.com/Arquisoft/yovi_en3b
3. You will see a banner suggesting to create a PR. Click on **"Compare & pull request"**.
4. Set the **base branch** to `develop` and the **compare branch** to your branch.
5. Add a descriptive title and description of your changes.
6. Click on **"Create pull request"**.
7. Wait for at least one team member to **review and approve** the PR.
8. Once approved, click on **"Merge pull request"**.

---

## 4. 📝 Regular workflow: commit and push

### Step by step

```bash
# 1. Check which branch you're on
git branch

# 2. Make sure you're on your branch
git checkout your-branch

# 3. Pull the latest changes
git pull origin your-branch

# 4. (Work on your code... ✍️)

# 5. Check which files you've modified
git status

# 6. Add files to the staging area
git add .                        # Adds ALL modified files
# or
git add file1.js file2.js       # Adds specific files

# 7. Make the commit with a descriptive message
git commit -m "feat: added login functionality"

# 8. Push the changes to the remote repository
git push origin your-branch
```

**Note:** The "Step by step" above describes the flow when you work in your personal branch on your own features. If you need to share the implementation or work on a feature together with colleagues (for example a joint front-end or back-end feature), create a collaborative branch (for example `feature/name`) and develop locally on your personal branch; then push and open a Pull Request to the collaborative branch or to `develop` as appropriate to integrate the shared work. In any case, everyone should work first on their own personal branch and **not** directly on `front-end` or `back-end`: those branches are temporary and may be deleted once their implementation cycle finishes.


### What does each step imply?

| Command      | What does it do?                                                              |
|--------------|-------------------------------------------------------------------------------|
| `git status` | Shows modified, added, or deleted files.                                      |
| `git add`    | Moves changes to the **staging area** (gets them "ready" for the commit).     |
| `git commit` | Creates a **"snapshot"** of your changes in the local history.                |
| `git push`   | **Uploads** your local commits to the remote repository on GitHub.            |

### Workflow visualization

```
Modified files ──► git add ──► Staging Area ──► git commit ──► Local history ──► git push ──► GitHub
```

### Good commit messages

Use a consistent format:

```
feat: new functionality
fix: bug fix
docs: documentation changes
style: formatting changes (no logic affected)
refactor: code restructuring
test: adding or modifying tests
```

Examples:

```bash
git commit -m "feat: added endpoint to get users"
git commit -m "fix: fixed login error when password is empty"
```

---

## 5. 📦 Git Stash: temporarily saving changes

### What is it?

A **stash** is like a **"temporary box"** where you can save changes that you don't want to commit yet, but you also don't want to lose. 📦

### When should you use it?

- You need to **switch branches** but you have uncommitted changes.
- You want to **clean your working directory** temporarily.
- Someone asks for help on another branch and you don't want to lose your progress.

### Main commands

```bash
# Save changes to the stash
git stash

# Save with a descriptive message
git stash save "changes in the login form"

# View the list of saved stashes
git stash list

# Retrieve changes from the last stash (and remove it from the list)
git stash pop

# Retrieve changes from the last stash (without removing it from the list)
git stash apply

# Retrieve a specific stash
git stash apply stash@{1}

# Delete a specific stash
git stash drop stash@{0}

# Delete ALL stashes
git stash clear
```

### Practical example: switching branches without losing changes

```bash
# 1. You're on your branch working and have uncommitted changes
git status  # You see modified files

# 2. You need to go to another branch urgently → save your changes
git stash save "WIP: form halfway done"

# 3. Your directory is now clean, you can switch branches
git checkout another-branch

# 4. You do whatever you need on the other branch...

# 5. You go back to your branch
git checkout your-branch

# 6. You retrieve your changes
git stash pop
```

### Visual diagram

```
Your code with changes ──► git stash ──► Changes saved in the "box" 📦
                                               │
You do what you need to...                     │
                                               │
Your clean code ◄──── git stash pop ◄──────────┘
```

---

## 6. 🚨 Recovering from errors

### 6.1 I made a commit by mistake (I have NOT pushed yet)

#### Option A: Undo the commit but keep the changes

```bash
git reset --soft HEAD~1
```

- Undoes the last commit.
- Your changes **go back to the staging area** (as if you had just run `git add`).

#### Option B: Undo the commit and remove changes from staging

```bash
git reset HEAD~1
```

- Undoes the last commit.
- Your changes **go back to the working directory** (as if you hadn't run `git add`).

#### Option C: Undo the commit and DELETE the changes

```bash
git reset --hard HEAD~1
```

> ⚠️ **WARNING:** This **permanently deletes** the changes from the last commit.

### 6.2 I made a commit by mistake (I already pushed)

If you've already pushed the commit to the remote and need to undo it:

```bash
# Create a new commit that "reverts" the changes from the previous commit
git revert HEAD
git push origin your-branch
```

> 💡 `git revert` is safer than `git reset` when you've already pushed, because it doesn't rewrite the history.

### 6.3 What are "not staged changes"?

When you run `git status`, you might see something like:

```
Changes not staged for commit:
    modified:   file1.js
    modified:   file2.js
```

This means you've **modified files** but you **haven't added them to the staging area** with `git add`. Git sees them as changes but won't include them in the next commit.

```
Working Directory              Staging Area            Repository
(not staged)            ──►    (staged/added)    ──►   (committed)
                       git add                 git commit
```

**Solution:** Simply run `git add` for the files you want to commit:

```bash
git add file1.js
# or to add everything:
git add .
```

### 6.4 Overwrite your local branch with another branch

If you want to **completely overwrite** your local branch with the content of another branch:

```bash
# 1. Make sure you're on your branch
git checkout your-branch

# 2. Fetch the latest changes from the remote
git fetch origin

# 3. Overwrite your branch with the other one
git reset --hard origin/another-branch
```

Example: overwrite your branch with `develop`:

```bash
git checkout your-branch
git fetch origin
git reset --hard origin/develop
```

If you need to push this to the remote:

```bash
git push --force
```

> ⚠️ **WARNING:** `--force` overwrites the remote history. Use with caution.

### 6.5 I have merge conflicts

When you run `git pull` or `git merge` and there are conflicts:

```bash
# 1. Git will notify you about the files with conflicts
git status

# 2. Open the conflicting files. You'll see something like:
<<<<<<< HEAD
your code
=======
code from the other branch
>>>>>>> another-branch

# 3. Edit the file and keep the correct code
#    (remove the <<<, ===, >>> markers)

# 4. Add the resolved files
git add resolved-file.js

# 5. Complete the merge
git commit -m "fix: resolved conflict in resolved-file.js"
```

### 6.6 I want to discard all my local changes (uncommitted)

```bash
# Discard changes in a specific file
git checkout -- file.js

# Discard ALL local changes
git checkout -- .

# If you also want to delete new (untracked) files
git clean -fd
```

### 6.7 I pushed to the wrong branch

```bash
# 1. Go to the wrong branch and undo the commit
git checkout wrong-branch
git reset --hard HEAD~1
git push --force origin wrong-branch

# 2. Go to the correct branch and apply the changes
git checkout correct-branch
git cherry-pick <commit-hash>
git push origin correct-branch
```

> 💡 You can get the commit hash with `git log --oneline`.

### 6.8 I added files to staging by mistake

```bash
# Remove a file from staging (but keep the changes)
git reset HEAD file.js

# Remove ALL files from staging
git reset HEAD
```

---

## 7. 📋 Quick command reference

| Action                                           | Command                                                         |
|--------------------------------------------------|-----------------------------------------------------------------|
| Clone the repo (only once)                       | `git clone https://github.com/Arquisoft/yovi_en3b.git`          |
| See which branch you're on                       | `git branch`                                                    |
| Switch branches                                  | `git checkout branch-name`                                      |
| Create and switch to a new branch                | `git checkout -b new-branch`                                    |
| Fetch info from remote (without modifying local) | `git fetch origin`                                              |
| Pull and merge changes                           | `git pull origin branch-name`                                   |
| See modified files                               | `git status`                                                    |
| Add files to staging                             | `git add .` or `git add file`                                   |
| Make a commit                                    | `git commit -m "message"`                                       |
| Push changes to remote                           | `git push origin branch-name`                                   |
| Save changes temporarily                         | `git stash`                                                     |
| Retrieve changes from stash                      | `git stash pop`                                                 |
| Undo last commit (without push)                  | `git reset --soft HEAD~1`                                       |
| Overwrite local branch with another              | `git reset --hard origin/another-branch`                        |
| Discard local changes                            | `git checkout -- .`                                             |
| View commit history                              | `git log --oneline`                                             |
| Force push (overwrite remote)                    | `git push --force`                                              |

---

> 📌 **Remember:** When in doubt, `git status` and `git log --oneline` are your best friends to know what state you're in.

> 🤝 **Safe workflow:** `pull → code → add → commit → push → Pull Request to develop`

> ⚠️ **Never work directly on `master`.**

> 🔒 **Any merge to `develop` must be done through a Pull Request (PR) on GitHub.**