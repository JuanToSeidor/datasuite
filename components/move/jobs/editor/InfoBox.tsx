/** Equivalente local del `InfoBox` de datasync (monitoring): etiqueta + valor, con separador opcional. */
export default function InfoBox({ text, value, border = false }: { text: string; value: string; border?: boolean }) {
  return (
    <div className={`flex w-1/2 flex-col gap-0.5 px-2.5 ${border ? "border-r! border-neutral-300" : ""}`}>
      <p className="font-poppins text-xs text-neutral-800">{text}</p>
      <p className="font-poppins text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
