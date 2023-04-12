
import type { PageLoad } from './$types';

export const load = (async () => {
  let news = [

    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
    {
      title: 'News 1',
      description: " Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content, makinlook like readable English. Many desktop publishing packages"
      , date: '16 Nov 2023'
    },
  ]
  return {
    news
  };
});