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

  "traspaso-fondos": {
    slug: "traspaso-fondos",
    title: "Fondos indexados vs ETFs: el truco del traspaso",
    summary: "La ventaja fiscal española que hace que casi todo el mundo FIRE prefiera fondos a ETFs.",
    readingMinutes: 4,
    action: { label: "Revisa tus cuentas de inversión", href: "/accounts" },
    body: `## La regla que cambia el juego en España

Fuera de España, mucha gente invierte en **ETFs**. Aquí, la mayoría de la comunidad FIRE prefiere **fondos indexados**, y la razón es fiscal: el **traspaso**.

## ¿Qué es el traspaso?

En España puedes mover tu dinero de un **fondo** a otro (un *traspaso*) **sin pagar impuestos por las ganancias**. El impuesto se aplaza hasta que finalmente vendes a efectivo (el *reembolso*).

- ¿Quieres cambiar de un fondo caro a uno más barato? Traspaso, sin tributar.
- ¿Quieres reducir riesgo cerca de la jubilación? Traspaso, sin tributar.
- Mientras tanto, **el 100% de tu dinero sigue componiendo**.

## ¿Y los ETFs?

Los **ETFs no son traspasables** en España. Cada vez que vendes un ETF, pagas IRPF sobre la ganancia ese mismo año (19%–30%), aunque vuelvas a comprar al instante.

## Por qué importa para el FIRE

Décadas de interés compuesto **sin fugas fiscales** marcan una diferencia enorme. Por eso el camino habitual aquí es: **fondos indexados** en una plataforma española (MyInvestor, Openbank, un robo-advisor…), no ETFs.

> Ojo: el traspaso es entre **fondos**. Es educación, no recomendación de producto.`,
  },

  "fiscalidad-inversor": {
    slug: "fiscalidad-inversor",
    title: "Fiscalidad del inversor en España (sin dramas)",
    summary: "Cómo tributan tus inversiones en el IRPF, explicado claro.",
    readingMinutes: 4,
    action: { label: "Ajusta tu colchón fiscal (SWR)", href: "/ajustes" },
    body: `## La base del ahorro

Las ganancias de tus inversiones (vender fondos/acciones con beneficio, dividendos, intereses) tributan en la **base del ahorro** del IRPF, con esta escala (2025–2026):

| Ganancia anual | Tipo |
|---|---|
| Hasta 6.000 € | 19% |
| 6.000 – 50.000 € | 21% |
| 50.000 – 200.000 € | 23% |
| 200.000 – 300.000 € | 27% |
| Más de 300.000 € | 30% |

Es **progresivo por tramos**: cada tipo se aplica solo a la parte de la ganancia que cae en ese tramo, no a todo.

Solo tributas por la **ganancia**, no por todo lo que retiras, y solo **cuando vendes** (ver el [traspaso](/aprender/traspaso-fondos)).

## Qué significa para tu FIRE

Tu "número FIRE" se calcula sobre lo que **gastas**, pero al retirar pagarás IRPF sobre las plusvalías. Por eso mucha gente en España usa una tasa de retirada del **3,5%** en vez del 4%, para dejar margen a los impuestos. Puedes elegirlo en **Ajustes**.

## Trucos legales habituales

- **Compensar pérdidas con ganancias** en la declaración.
- El **traspaso** entre fondos para no tributar al rebalancear.
- Aprovechar el tramo bajo (19%) repartiendo ventas entre años.

Esto es educación financiera, no asesoramiento. Si tu caso es complejo, consulta a un asesor.`,
  },

  "brokers-espana": {
    slug: "brokers-espana",
    title: "Brokers en España: la realidad",
    summary: "MyInvestor, Trade Republic, IBKR, robos… cuál encaja con tu fase, sin marketing.",
    readingMinutes: 5,
    action: { label: "Registra tus cuentas", href: "/accounts" },
    body: `## No hay un broker "mejor", hay uno mejor *para ti*

**MyInvestor** — el favorito para invertir en fondos indexados por tu cuenta.
- Banco español (supervisado por el Banco de España): **sin Modelo 720**, fiscalidad sencilla desde España.
- Fondos Vanguard/Amundi/iShares con traspaso, sin comisiones de custodia.
- *Pega real (lo dice la comunidad):* su app a veces falla o muestra saldos raros. Mejóralo teniendo tu propio registro de patrimonio… como esta app 😉.

**Trade Republic** — sencillo y barato para aportaciones automáticas.
- Broker alemán; planes de inversión periódicos **sin comisión**, ideal para DCA.
- Es extranjero: ojo con el traspaso (no funciona igual) y con reportar si acumulas mucho.

**DEGIRO / Interactive Brokers** — para carteras grandes o ETFs.
- Muy baratos y potentes. Son extranjeros: **Modelo 720 si superas 50.000 €** y declaras tú las ganancias.

**Robo-advisors (Indexa, Finizens, inbestMe)** — "configúralo y olvídate".
- Cartera indexada y rebalanceo automático por ~0,6%/año. Cómodo, pero ese 0,6% compuesto durante décadas pesa frente a hacerlo tú al ~0,1–0,2%.

## La regla simple

Empiezas y quieres lo fácil y español → **MyInvestor o un robo**. Automatizar barato → **Trade Republic**. Cartera grande y avanzada → **IBKR**. Educación, no recomendación.`,
  },

  "planes-pensiones": {
    slug: "planes-pensiones",
    title: "Planes de pensiones: la letra pequeña",
    summary: "Por qué la comunidad FIRE es tibia con ellos (y cuándo sí compensan).",
    readingMinutes: 3,
    action: { label: "Revisa tu plan FIRE", href: "/" },
    body: `## La promesa: desgravar

Un plan de pensiones individual te deja **desgravar hasta 1.500 €/año** en el IRPF. Suena bien… hasta que ves la letra pequeña.

## Los peros

- **El límite es pequeño.** Antes eran 8.000 €/año; lo bajaron a 2.000 y luego a **1.500 €**. El incentivo se ha movido hacia los **planes de empleo** (de empresa), donde caben hasta 8.500 € más.
- **Es dinero atrapado.** Solo puedes rescatarlo al jubilarte, por desempleo, enfermedad grave… o, desde 2025, las **aportaciones con más de 10 años** de antigüedad.
- **Tributa como trabajo al rescatar.** Lo que sacas suma a tu base general (hasta 45%+), no a la del ahorro. Puedes acabar pagando más impuestos de los que ahorraste.

## ¿Cuándo sí?

- Si tu **empresa** ofrece plan de empleo (¡y aporta!): cógelo, casi siempre vale la pena.
- Si estás en un **tramo marginal alto** y quieres la desgravación de esos 1.500 €.

Para la mayoría en FIRE, la prioridad son **fondos indexados líquidos y traspasables**, y el plan de pensiones solo de forma oportunista.`,
  },

  "comprar-vs-alquilar": {
    slug: "comprar-vs-alquilar",
    title: "¿Comprar o alquilar?",
    summary: "Alquilar no es 'tirar el dinero'. Depende de los números, y aquí están.",
    readingMinutes: 4,
    action: { label: "Mira tu patrimonio", href: "/" },
    body: `## El mito

"Alquilar es tirar el dinero." Es la frase más repetida… y no siempre es cierta.

## La pregunta correcta

No es *"¿alquilar o comprar?"*, es *"¿qué hago con la diferencia?"*. Comprar tiene costes que no se ven: entrada, ITP/IVA, notaría, IBI, comunidad, derramas, mantenimiento, y los **intereses** de la hipoteca.

Si alquilas más barato de lo que te costaría comprar **e inviertes la diferencia** en fondos indexados, en muchos casos sales igual o mejor — y con mucha más flexibilidad.

## Cuándo comprar suele ganar

- Te vas a quedar **muchos años** (5–10+), que diluyen los costes de compra.
- El alquiler en tu zona es caro frente al precio de compra.
- Valoras la estabilidad por encima de la movilidad.

## Cuándo alquilar suele ganar

- Necesitas **flexibilidad** (trabajo, ciudad, etapa vital).
- Los precios de compra están disparados respecto al alquiler.
- Vas a **invertir** de verdad la diferencia (la clave).

## Para FIRE

Tu vivienda habitual **no genera renta** ni cuenta para el 4%. No es "mala", pero no confundas *comprar tu casa* con *invertir*. Si buscas rentabilidad, los fondos suelen ser más simples y líquidos que un piso.`,
  },

  "amortizar-vs-invertir": {
    slug: "amortizar-vs-invertir",
    title: "¿Amortizar hipoteca o invertir?",
    summary: "La regla del tipo de interés, y el truco de 'reducir plazo' que te ahorra miles.",
    readingMinutes: 3,
    action: { label: "Revisa tus cuentas y deudas", href: "/accounts" },
    body: `## La regla sencilla

Compara dos números:
- El **tipo de interés** de tu hipoteca (lo que te cuesta la deuda).
- La **rentabilidad esperada** de invertir (histórica ~5–7% real en bolsa, con riesgo).

- ¿Hipoteca **barata** (p. ej. fija al 1–2%)? Matemáticamente suele compensar **invertir** la diferencia.
- ¿Hipoteca **cara** (variable alta)? Amortizar es una rentabilidad **segura** igual a tu tipo de interés.

Pero no todo son números: **quitarte deuda tranquiliza**. Una mezcla (invertir y amortizar un poco) es perfectamente razonable.

## El truco que poca gente conoce

Si amortizas, el banco te ofrece **reducir cuota** o **reducir plazo**. **Reducir plazo casi siempre te ahorra mucho más** en intereses totales, porque pagas durante menos años. Reducir cuota es más cómodo cada mes, pero pagas más al final.

## Y la fiscalidad

Si compraste tu vivienda **antes de 2013**, puede que aún tengas **deducción por amortizar** — un punto a favor de amortizar en ese caso.

Educación, no asesoramiento: el mejor plan es el que te deja dormir tranquilo.`,
  },

  "modelo-720": {
    slug: "modelo-720",
    title: "Modelo 720: activos en el extranjero",
    summary: "Si usas un broker extranjero, esto es lo que debes saber (sin el miedo antiguo).",
    readingMinutes: 3,
    action: { label: "Revisa dónde tienes tu dinero", href: "/accounts" },
    body: `## ¿A quién le afecta?

Al **Modelo 720** estás obligado si tienes **más de 50.000 €** en el extranjero en alguno de estos bloques: cuentas, valores (acciones/fondos/ETFs) o inmuebles. Se presenta entre el **1 de enero y el 31 de marzo** del año siguiente.

En la práctica te afecta si inviertes con **brokers extranjeros** (Interactive Brokers, DEGIRO, Trade Republic…) y superas ese umbral.

## La buena noticia

El antiguo régimen de **multas desproporcionadas** del 720 fue **anulado por el Tribunal de Justicia de la UE**. Hoy las sanciones siguen las reglas normales (mucho más suaves). Si lees guías viejas que hablan de "multas del 150%", están desactualizadas.

## Importante (errores comunes)

- El **Modelo D6 ya no se exige** para el inversor minorista (reforma de 2023, en vigor desde 2024). Muchas guías antiguas aún te dicen que lo presentes: **ya no hace falta**.
- Existe el **Modelo 721** para **criptomonedas en el extranjero** (>50.000 €) custodiadas por terceros. Tu *cold wallet* propia (Ledger/Trezor) **no** se declara aquí.

## El atajo

¿No quieres líos? Usa **plataformas españolas** (MyInvestor, Openbank, robos): no generan Modelo 720 y la fiscalidad va sola. Esto es educación, no asesoramiento fiscal.`,
  },
};

export const COACHING_LIST: CoachingModule[] = [
  COACHING_MODULES["fire-basics"],
  COACHING_MODULES["savings-rate"],
  COACHING_MODULES["traspaso-fondos"],
  COACHING_MODULES["index-funds"],
  COACHING_MODULES["dollar-cost-averaging"],
  COACHING_MODULES["brokers-espana"],
  COACHING_MODULES["fiscalidad-inversor"],
  COACHING_MODULES["comprar-vs-alquilar"],
  COACHING_MODULES["amortizar-vs-invertir"],
  COACHING_MODULES["emergency-fund"],
  COACHING_MODULES["planes-pensiones"],
  COACHING_MODULES["modelo-720"],
  COACHING_MODULES["sinking-funds"],
];
