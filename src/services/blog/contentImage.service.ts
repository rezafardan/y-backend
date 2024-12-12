export const extractContentImageIds = (content: any): string[] => {
  if (!content || !content.content) return [];

  return content.content
    .filter((item: any) => item.type === "image" && item.attrs?.id)
    .map((item: any) => item.attrs.id);
};
