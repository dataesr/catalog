import { Card, CardDescription, Icon } from '@dataesr/react-dsfr';

export default function ToolCard({ key, setSelectedTool, tool }) {
  return (
    <Card
      href={tool?.html_url}
      key={key}
      onClick={() => setSelectedTool(tool)}
    >
      <CardDescription>
        <div>
          {tool.name}
          {' '}
          <Icon name={tool?.private ? 'ri-lock-line' : 'ri-lock-unlock-line'} />
        </div>
        {tool?.description && (
          <div>
            <Icon name='ri-pen-nib-line' />
            {tool.description}
          </div>
        )}
        {tool?.license?.name && (
          <div>
            <Icon name='ri-scales-3-line' />
            {tool.license.name}
          </div>
        )}
        {tool?.language && (
          <div>
            <Icon name='ri-code-s-slash-line' />
            {tool.language}
          </div>
        )}
      </CardDescription>
    </Card>
  );
};
