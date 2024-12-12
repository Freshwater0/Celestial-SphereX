import Handlebars from 'handlebars';

const templates = {
  modern: `
    <div style="font-family: Arial, sans-serif;">
      <h1>{{title}}</h1>
      {{#each sections}}
        <h2>{{title}}</h2>
        <p>{{content}}</p>
      {{/each}}
      <h3>References</h3>
      <ul>
        {{#each references}}
          <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  `,
  classic: `
    <div style="font-family: Times New Roman, serif;">
      <h1>{{title}}</h1>
      {{#each sections}}
        <h2>{{title}}</h2>
        <p>{{content}}</p>
      {{/each}}
      <h3>References</h3>
      <ol>
        {{#each references}}
          <li>{{this}}</li>
        {{/each}}
      </ol>
    </div>
  `
};

export const renderTemplate = (reportData, templateType) => {
  const templateSource = templates[templateType];
  const template = Handlebars.compile(templateSource);
  return template(reportData);
};
