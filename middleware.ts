import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkServerSession } from "./lib/api/serverApi";
import { parse } from "cookie";

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));
  

  if (!accessToken) {
    if (refreshToken) {

      const data = await checkServerSession();
      const setCookie = data.headers['set-cookie'];

      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = {
            expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
            path: parsed.Path,
            maxAge: Number(parsed['Max-Age']),
          };
          if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options);
          if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options);
        }

        if (isPublicRoute) {
          return NextResponse.redirect(new URL('/', request.url), {
            headers: {
              Cookie: cookieStore.toString(),
            },
          });
        }

          if (isPrivateRoute) {
            return NextResponse.next({
              headers: {
                Cookie: cookieStore.toString(),
              },
            });
          }
        }
      }

      if (isPublicRoute) {
        return NextResponse.next();
      }

      if (isPrivateRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};


// import { NextRequest , NextResponse } from  'next/server' ;
//  import {cookies} from  'next/headers' ;
//  import {parse} from  'cookie' ;
//  import { checkServerSession } from  './lib/api/serverApi' ;

// const privateRoutes = [ '/profile', '/notes' ];
//  const publicRoutes = [ '/sign-in' , '/sign-up' ];

// export  async  function  middleware ( request: NextRequest ) {
//    const { pathname } = request.nextUrl ;
//    const cookieStore = await  cookies ();
//    const accessToken=cookieStore.get ( 'accessToken' )?.value ;
//    const refreshToken=cookieStore.get ( 'refreshToken' )?.value ;

//   const isPublicRoute = publicRoutes. some ( ( route ) => pathname.startsWith (route));
//    const isPrivateRoute = privateRoutes. some ( ( route ) => pathname.startsWith (route));

//   if (!accessToken) {
//      if (refreshToken) {
//        // Если accessToken отсутствует, но есть refreshToken — нужно проверить сессию даже для публичного маршрута, 
//       // ведь сессия может оставаться активной, и тогда нужно запретить доступ к публичному маршруту. 
//       const data = await  checkServerSession ();
//        const setCookie=data.headers [ 'set-cookie' ];

//       if (setCookie) {
//          const cookieArray = Array.isArray (setCookie) ? setCookie: [setCookie];
//          for ( const cookieStr of cookieArray) {
//            const parsed = parse (cookieStr);
//            const options = {
//              expires : parsed.Expires ? new  Date (parsed.Expires ) : undefined ,
//              path : parsed.Path ,
//              maxAge : Number (parsed[ 'Max-Age' ]),
//           };
//           if (parsed.accessToken ) cookieStore.set ( 'accessToken' , parsed.accessToken , options);
//            if (parsed.refreshToken ) cookieStore.set ( 'refreshToken' , parsed.refreshToken , options);
//         }
//         // Если сессия все еще активна: 
//         // для публичного маршрута – выполняем редирект на главную. 
//         if (isPublicRoute) {
//            return  NextResponse.redirect ( new  URL( '/' , request.url ), {
//              headers : {
//                Cookie : cookieStore.toString (),
//             },
//           });
//         }
//         // для частного маршрута – разрешаем доступ 
//         if (isPrivateRoute) {
//            return  NextResponse.next ({
//              headers : {
//                Cookie : cookieStore.toString (),
//             },
//           });
//         }
//       }
//     }
//     // Если refreshToken или сессии нет: 
//     // публичный маршрут – разрешаем доступ 
//     if (isPublicRoute) {
//        return  NextResponse.next ();
//     }

//     // частный маршрут - редирект на страницу входа 
//     if (isPrivateRoute) {
//        return  NextResponse.redirect ( new  URL ( '/sign-in' , request.url ));
//     }
//   }

//   // Если accessToken существует: 
//   // публичный маршрут – выполняем редирект на главную 
//   if (isPublicRoute) {
//      return  NextResponse . redirect ( new  URL ( '/' , request. url ));
//   }
//   // частный маршрут – разрешаем доступ 
//   if (isPrivateRoute) {
//      return  NextResponse . next ();
//   }
// }

// export  const config = {
//    matcher : [ '/profile/:path*' , '/sign-in' , '/sign-up' ],
// };