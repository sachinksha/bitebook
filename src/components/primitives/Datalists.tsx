export function Datalists({ dishes, persons }) {
  return (
    <>
      <datalist id="bb-dishes">
        {dishes.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <datalist id="bb-persons">
        {persons.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </>
  );
}
