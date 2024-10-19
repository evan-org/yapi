import { useRouter } from 'next/navigation';

interface PushType {
  (path: string): void;
  (path: string, options: Record<string, string | number>): void;
  (path: string, params: string[], options?: Record<string, any>): void;
}

export type RouterWithOptionsType = {
  push: PushType;
  back: () => void;
};

export const useRouterWithOptions = () => {
  const router = useRouter();

  const newRouter: RouterWithOptionsType = {
    push(
      path: string,
      optionsOrParams?: Record<string, any> | string[],
      options?: Record<string, any>
    ) {
      if (optionsOrParams) {
        if (Array.isArray(optionsOrParams)) {
          for (const value of optionsOrParams) {
            path += '/' + value;
          }
          if (!options) {
            router.push(path);
            return;
          }
          optionsOrParams = options;
        }
        let idx = 0;
        for (const key in optionsOrParams) {
          const value = optionsOrParams[key];
          if (value === undefined) continue;
          path += `${idx === 0 ? '?' : '&'}${key}=${value}`;
          idx++;
        }
      }
      router.push(path);
    },
    back() {
      router.back();
    },
  };

  return newRouter;
};
