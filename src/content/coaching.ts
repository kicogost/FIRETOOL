/**
 * Coaching module content (PRD §10) — six short modules in plain Spanish with
 * EUR examples, stored as markdown and rendered in-app. Each ends with one
 * suggested in-app action. A permanent disclaimer is shown on every module page.
 */
import type { CoachingSlug } from "@/lib/coaching";

export interface CoachingModule {
  slug: CoachingSlug;
  title: string;
  /** One-liner shown on the dashboard coaching card. */
  summary: string;
  readingMinutes: number;
  body: string; // markdown
  action: { label: string; href: string };
}

export const COACHING_MODULES: Record<CoachingSlug, CoachingModule> = {
  "fire-basics": {
    slug: "fire-basics",
    title: "FIRE y tu número",
    summary: "Qué es la independencia financiera y cómo se calcula tu objetivo.",
    readingMinutes: 4,
    action: { label: "Revisa tu panel", href: "/" },
    body: `## ¿Qué es FIRE?

FIRE significa *Financial Independence, Retire Early*: independencia financiera para que trabajar sea **opcional**. No va de hacerse rico, sino de acumular suficiente capital invertido para que sus rendimientos cubran tus gastos.

## La regla del 4% y tu número FIRE

La idea, respaldada por estudios históricos de mercado, es que puedes retirar cada año alrededor del **4%** de tu cartera sin agotarla. Dándole la vuelta:

> Tu número FIRE = gasto anual × 25

Si gastas **1.800 €/mes**, son **21.600 €/año**. Tu número FIRE sería:

\`21.600 € × 25 = 540.000 €\`

Cuando tu patrimonio **invertido** alcanza esa cifra, eres financieramente independiente.

## Lo que de verdad mueve la aguja

Dos palancas controlan cuándo llegas:

1. **Cuánto inviertes cada mes** (tu tasa de ahorro).
2. **El tiempo**, gracias al interés compuesto.

No necesitas un sueldo enorme. Necesitas un sistema: invertir una parte fija cada mes y dejar que el tiempo trabaje. Esta app te muestra cómo cada aportación adelanta tu fecha de libertad.`,
  },

  "emergency-fund": {
    slug: "emergency-fund",
    title: "Fondo de emergencia antes de invertir",
    summary: "Tu colchón está por debajo de 3 meses. Constrúyelo antes de invertir más.",
    readingMinutes: 3,
    action: { label: "Crea una cuenta de efectivo", href: "/accounts" },
    body: `## Primero, la red de seguridad

Antes de invertir con fuerza, conviene tener un **fondo de emergencia**: dinero líquido para imprevistos (una avería, quedarte sin trabajo, una urgencia médica).

## ¿Cuánto?

Entre **3 y 6 meses** de tus gastos. Si gastas **1.800 €/mes**, tu colchón objetivo está entre **5.400 €** y **10.800 €**.

## ¿Por qué importa tanto?

Sin colchón, un imprevisto te obliga a **vender inversiones en el peor momento** o a endeudarte con tarjetas al 20%. El fondo de emergencia evita justo eso: te deja invertir con tranquilidad porque sabes que un susto no descarrila tu plan.

## Dónde guardarlo

En **efectivo accesible**: una cuenta remunerada o un depósito a la vista. No en bolsa: este dinero no busca rentabilidad, busca estar ahí cuando lo necesites.

Cuando tu colchón llegue a 3 meses, pasa a invertir la diferencia.`,
  },

  "dollar-cost-averaging": {
    slug: "dollar-cost-averaging",
    title: "Aportaciones periódicas (DCA)",
    summary: "Hace tiempo que no inviertes. Lo más simple que funciona: una cantidad fija cada mes.",
    readingMinutes: 3,
    action: { label: "Registra una aportación", href: "/" },
    body: `## El método aburrido que funciona

*Dollar Cost Averaging* (DCA) significa invertir una **cantidad fija cada mes**, pase lo que pase en el mercado. Por ejemplo, **300 € el día 1 de cada mes**.

## ¿Por qué funciona?

- **Eliminas el "cuándo entro"**: nadie acierta el mejor momento de forma consistente, ni los profesionales.
- **Compras más barato en las caídas**: con 300 € compras más participaciones cuando el precio baja y menos cuando sube. Tu precio medio se suaviza.
- **Lo conviertes en hábito**: una orden automática cada mes y te olvidas.

## Ejemplo

Inviertes 300 €/mes. Un mes la participación cuesta 100 € (compras 3) y al siguiente cuesta 75 € (compras 4). Sin pensar, has comprado más cuando estaba más barato.

## El error a evitar

Esperar a "que baje" para entrar. El tiempo dentro del mercado importa más que acertar el momento. Empieza con una cantidad que puedas mantener, aunque sean **50 €/mes**, y auméntala con el tiempo.`,
  },

  "index-funds": {
    slug: "index-funds",
    title: "Fondos indexados 101",
    summary: "Has hecho tu primera aportación. Aprende dónde suele invertir quien busca FIRE.",
    readingMinutes: 4,
    action: { label: "Revisa tus cuentas de inversión", href: "/accounts" },
    body: `## ¿Qué es un fondo indexado?

Es un fondo que, en lugar de intentar elegir las "mejores" empresas, **compra todas las de un índice**. Por ejemplo, un fondo que replica el **MSCI World** invierte en más de 1.500 empresas grandes de países desarrollados a la vez.

## Por qué encajan con FIRE

- **Diversificación instantánea**: con una sola compra tienes miles de empresas. Si a una le va mal, apenas te afecta.
- **Comisiones bajas**: un indexado puede costar **0,20% al año**, frente al **1,5–2%** de muchos fondos de gestión activa. Esa diferencia, durante 20 años, son **decenas de miles de euros**.
- **La mayoría de gestores activos no baten a su índice** a largo plazo. Indexarte es apostar por el conjunto del mercado, no por un adivino.

## Un ejemplo de coste

Sobre una cartera de **100.000 €**:

- Indexado al 0,20% → **200 €/año**
- Fondo activo al 1,80% → **1.800 €/año**

Misma cartera, **1.600 €/año** de diferencia que se quedan compuestos en tu bolsillo.

## Recuerda

Esto es educación, no una recomendación de producto. Elige según tu situación y, si lo necesitas, consulta a un profesional independiente.`,
  },

  "sinking-funds": {
    slug: "sinking-funds",
    title: "Fondos para gastos puntuales",
    summary: "Detectamos un gasto muy por encima de su media. Un fondo hucha lo suaviza.",
    readingMinutes: 3,
    action: { label: "Marca una categoría como fondo", href: "/accounts" },
    body: `## El problema de los gastos "que aparecen de golpe"

El seguro del coche, las vacaciones, los regalos de diciembre, la matrícula… No son emergencias: **sabes que llegan**, pero llegan en un solo mes y descuadran tu presupuesto.

## La solución: el fondo hucha (*sinking fund*)

En vez de pagar **1.200 € de golpe** en el seguro anual, apartas **100 € cada mes** durante el año. Cuando llega la factura, el dinero ya está ahí. Sin sustos, sin tarjeta.

## Cómo montarlo

1. Lista tus gastos grandes y previsibles del año.
2. Suma cuánto son y divídelo entre 12.
3. Aparta esa cantidad cada mes en una categoría marcada como **fondo**.

## Ejemplo

- Seguro coche: 1.200 €/año → 100 €/mes
- Vacaciones: 1.800 €/año → 150 €/mes
- Regalos: 600 €/año → 50 €/mes

Total: **300 €/mes** que evitan tres picos enormes y mantienen tu tasa de ahorro estable.`,
  },

  "savings-rate": {
    slug: "savings-rate",
    title: "La tasa de ahorro: el único número que importa",
    summary: "Tu tasa de ahorro está por debajo del 20%. Es la palanca que más acelera tu FIRE.",
    readingMinutes: 4,
    action: { label: "Revisa tus gastos del mes", href: "/" },
    body: `## Por qué la tasa de ahorro lo domina todo

Tu **tasa de ahorro** es la parte de tus ingresos que no gastas:

\`(ingresos − gastos) / ingresos\`

Es el número más importante hacia FIRE, porque actúa **por los dos lados**: cada euro que no gastas es un euro que inviertes **y** un euro menos que necesitarás gastar en el futuro.

## El dato que sorprende

Tu tiempo hasta FIRE depende muchísimo más de tu tasa de ahorro que de tu sueldo:

- Ahorrando el **10%**, necesitas trabajar del orden de **40 años**.
- Ahorrando el **30%**, bajas a unos **28 años**.
- Ahorrando el **50%**, rondas los **17 años**.

Mismos ingresos. Lo que cambia es cuánto te quedas.

Con unos ingresos de **2.000 €/mes**: ahorrar el 15% son **300 €/mes**; subir al 25% son **500 €/mes**. Esos **200 €** extra cada mes, invertidos durante años, adelantan tu libertad de forma notable.

## Cómo subirla sin sufrir

- Ataca los **gastos grandes y recurrentes** (vivienda, coche, suscripciones), no los cafés.
- Automatiza la inversión **el día que cobras**, antes de gastar.
- Sube la aportación un poco cada vez que te suban el sueldo.

Si pasas del **15% al 25%**, no es un ajuste menor: te puede adelantar la libertad **varios años**.`,
  },
};

export const COACHING_LIST: CoachingModule[] = [
  COACHING_MODULES["fire-basics"],
  COACHING_MODULES["savings-rate"],
  COACHING_MODULES["dollar-cost-averaging"],
  COACHING_MODULES["index-funds"],
  COACHING_MODULES["emergency-fund"],
  COACHING_MODULES["sinking-funds"],
];
