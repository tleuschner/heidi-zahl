import neo4j from "neo4j-driver";
import p from "prompt-sync";

const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "test")
);

const getHeidiPath = async (personName) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (PersonA:Cast {name: $name} ),
        (Heidi:Cast {name: 'Heidi Klum'}),
        p = shortestPath((Heidi)-[:ACTS_IN*]-(PersonA))
        RETURN p`,
      { name: personName }
    );

    // @ts-ignore
    const path = getPath(result.records[0]._fields[0].segments);
    console.log(path);
  } finally {
    await session.close();
  }

  // on application exit:
  await driver.close();
};

const getPath = (result) => {
  const path = result
    .map((s, index) => {
      if (index === 0 && s.start.labels.includes("Cast")) {
        return `${s.start.properties.name || s.start.properties.title}\n->\n${
          s.relationship.type
        }\n->\n${s.end.properties.name || s.end.properties.title}`;
      } else if (s.start.labels.includes("Movie")) {
        return `\n->\nHAS_ACTOR\n->\n${s.end.properties.name}\n->\n`;
      } else {
        return `${s.relationship.type}\n->\n${
          s.end.properties.name || s.end.properties.title
        }`;
      }
    })
    .join("");

  return `
  ${path.substring(0, path.length - 3)}

  Heidi-Zahl von ${result.length}
  `;
};

const prompt = p();

console.log(
  "Wie divers ist Heidi Klum?\n Gib eine:n Schauspieler:in ein und finde heraus, ob Heidi eine Connection hat!"
);
const name = prompt("Schauspieler eingeben: ");
getHeidiPath(name);
