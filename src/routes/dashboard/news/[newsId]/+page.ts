interface Params {
  newsId: string;
}export const load = ({ params }: { params: Params }) => {
  console.log(params.newsId)
  return {
    newsId: params.newsId
  }
}