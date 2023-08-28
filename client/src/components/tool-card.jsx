import { Card, CardDescription, Icon, Text } from "@dataesr/react-dsfr";
import { capitalize } from "../utils/string";

export default function ToolCard({ setSelectedTool, tool }) {
  return (
    <Card href={tool?.html_url} onClick={() => setSelectedTool(tool)}>
      <CardDescription>
        <d>
          <Text as="h1">
            {capitalize(tool.name).replaceAll("_", " ").replaceAll("-", " ")}
          </Text>
          {tool?.private && (
            <Text>
              Private <Icon size="lg" name="ri-git-repository-private-line" />
            </Text>
          )}
        </d>
        {tool?.description && (
          <div>
            <Icon size="lg" name="ri-pen-nib-line" />
            {tool.description}
          </div>
        )}
        {tool?.license?.name && (
          <div>
            <Icon size="lg" name="ri-scales-3-line" />
            {tool.license.name}
          </div>
        )}
        {tool?.language && (
          <div>
            <Icon size="lg" name="ri-code-s-slash-line" />
            {tool.language}
          </div>
        )}
      </CardDescription>
    </Card>
  );
}
