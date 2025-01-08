export const extractContentImageIds = (content: any): string[] => {
  // CHECK CONTENT VALUE
  if (!content || !content.content) return [];

  // EXTRACT IMAGE
  const contentImageIds = content.content
    .filter((item: any) => item.type === "image" && item.attrs?.id)
    .map((item: any) => item.attrs.id);

  return contentImageIds;
};
