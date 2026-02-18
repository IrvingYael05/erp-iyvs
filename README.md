# Enterprise Resource Planning (ERP) System

Sistema de gestión empresarial escalable, construido con la última tecnología del ecosistema Angular para garantizar máximo rendimiento, modularidad y mantenibilidad a largo plazo.

Este proyecto sirve como la base arquitectónica para un ERP completo, implementando las mejores prácticas de desarrollo de software modernas (2026).

## Tech Stack & Arquitectura

El proyecto está diseñado para ser **Zoneless** (sin Zone.js), aprovechando la detección de cambios nativa de Angular para un rendimiento superior en aplicaciones de gran escala.

- **Core Framework:** [Angular 20](https://angular.io/) (Standalone Components & Zoneless Change Detection).
- **UI Component Library:** [PrimeNG 20](https://primeng.org/) (Theme: Aura).
- **Styling Engine:** SCSS + CSS Variables + PrimeFlex/Utilities.
- **Iconography:** PrimeIcons.
- **Typography:** Inter (Google Fonts) optimizada para legibilidad en dashboards.
- **Runtime Environment:** Node.js 22.

## Características Clave

- **Rendimiento Nativo:** Configurado explícitamente con `provideZonelessChangeDetection()` para eliminar la sobrecarga de Zone.js.
- **Diseño Moderno:** Implementación del sistema de diseño **Aura** de PrimeNG con tokens semánticos.
- **Tipografía Empresarial:** Integración de la fuente **Inter** para máxima claridad en tablas y datos densos.
- **Strict Mode:** TypeScript configurado en modo estricto para prevenir errores en tiempo de compilación.

## Requisitos Previos

Asegúrate de tener instalado el siguiente entorno para evitar conflictos de dependencias:

- **Node.js:** v22.x o superior.
- **NPM:** v10.x o superior.

## Estructura del Proyecto (Roadmap)

La arquitectura está planeada para escalar siguiendo el patrón **Core/Shared/Features**:

```bash
src/
├── app/
│   ├── core/          # Servicios singleton, guardias, interceptores y modelos globales.
│   ├── shared/        # Componentes UI reutilizables (Botones, Inputs customizados).
│   ├── layout/        # Estructura principal (Sidebar, Topbar, Footer).
│   ├── features/      # Módulos de negocio (Ventas, Inventario, RRHH).
│   └── app.config.ts  # Configuración global (Zoneless, Providers).
├── assets/            # Imágenes y recursos estáticos.
└── styles.scss        # Estilos globales y variables de tema (CSS Variables).
```
