import {
  NewsItem,
  NewsPagination,
  NewsTradingFilters,
} from '@/types/newstrading';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getData = async (
  filter: NewsTradingFilters,
): Promise<{ news: NewsItem[]; pagination: NewsPagination }> => {
  const params: Record<string, string> = {};

  if (filter.page) params.page = filter.page;
  if (filter.limit) params.limit = filter.limit;
  if (filter.type) params.type = filter.type;
  if (filter.startTime) params.startTime = filter.startTime;
  if (filter.endTime) params.endTime = filter.endTime;
  if (filter.tokens) params.tokens = filter.tokens.join(',');

  const res = await axios.get(`/api/news-trading/feed`, {
    params,
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useNewsTradingFeedData = (filter: NewsTradingFilters) => {
  return useQuery({
    queryKey: ['newsFeedData'],
    queryFn: async () => await getData(filter),
    refetchInterval: 10000,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useNewsTradingFeedData;
