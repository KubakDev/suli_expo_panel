interface Params {
  newsId: string;
}export const load = ({ params }: { params: Params }) => {
  return {
    newsId: params.newsId
  }
}