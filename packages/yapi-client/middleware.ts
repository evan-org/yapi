import { NextRequest, NextResponse } from 'next/server'

//放到主目录和next.config.mjs同级
export function middleware(request: NextRequest) {
  // Check the origin from the request
  const token = request.headers.get('token') ?? ''
  
  //验证token，可以使用别人的算法，也可以使用自己的加密算法，使用对称加密验证sign串，秘钥在后台，使用秘钥加解锁
  //部分要求高的场景防篡改，可以额外在单个请求中加入自己的非对称加密规则
  if (!token) {
    return Response.json(
      { success: false, message: '未授权或或已过期' },
      { status: 401 }
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}