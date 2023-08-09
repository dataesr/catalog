import { Card, CardDescription, Icon, Tag, TagGroup } from '@dataesr/react-dsfr';

const formatDate = (date) => {
  return date.slice(0, 10).split("-").reverse().join("/");
}

export default function ToolCard({ tool }) {
  return (
    <Card
      href={tool?.html_url}
      key={tool.name}
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
        {tool?.topics && (
          <TagGroup>
            {tool.topics.filter((topic) => !!topic).map((topic) => (
              <Tag icon='ri-price-tag-3-line'>
                {topic}
              </Tag>
            ))}
          </TagGroup>
        )}
        {tool?.contact && (
          <div>
            <Icon name='ri-mail-line' />
            {tool.contact}
          </div>
        )}
        {tool?.updated_at && (
          <div>
            <Icon name='ri-history-line' />
            Mis à jour le {formatDate(tool.updated_at)}
          </div>
        )}
      </CardDescription>
    </Card>
  );
};
