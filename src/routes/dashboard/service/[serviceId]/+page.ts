interface Params {
  serviceId: string;
}export const load = ({ params }: { params: Params }) => {
  return {
    serviceId: params.serviceId
  }
}