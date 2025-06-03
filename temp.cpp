/*
 * Hii stalkerrs
 * Saicharan876
 *
 */
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <iostream>
#include <map>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <set>
#include <vector>
#include <stack>
#include <climits>
#include <numeric>
using namespace std;

typedef long long ll;
typedef vector<int> vi;
typedef vector<long long> vll;
typedef unsigned long long ull;

#define take(a, n)               \
    for (ll i = 0; i < (n); i++) \
        cin >> a[i];
#define output(temp) (temp ? cout << "YES\n" : cout << "NO\n")
#define v(temp) temp.begin(), temp.end()

ll gcd(ll a, ll b)
{
    while (b != 0)
    {
        ll temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

bool isPrime(ll n)
{
    if (n < 2)
        return false;
    if (n == 2)
        return true;
    if (n % 2 == 0)
        return false;
    for (ll i = 3; i * i <= n; i += 2)
        if (n % i == 0)
            return false;
    return true;
}

int gcd(int a, int b)
{
    return __gcd(a, b);
}

struct box
{
    int l, w, h;
};

void fibbonacci(int n, vector<int> &cubes)
{
    cubes[0] = 1;
    cubes[1] = 2;
    for (int i = 3; i < n; ++i)
    {
        cubes[i] = cubes[i - 1] + cubes[i - 2];
    }
}

bool Canstack(vector<int> cubes, box Box, int n, int m)
{

    int max_height = cubes[n - 1] + cubes[n - 2];
    if (Box.h >= max_height || Box.l >= max_height || Box.w >= max_height)
    {
        return true;
    }

    return false;
}

void solve()
{
    int n, m;
    cin >> n >> m;
    vi cubes(n);
    fibbonacci(n, cubes);

    int largest_side = cubes[n - 1];
    int max_height = cubes[n - 1] + cubes[n - 2];

    string temp;

    for (int i = 0; i < m; i++)
    {
        int w, l, h;

        if ((w >= max_height || l >= max_height || h >= max_height) && (w >= largest_side && l >= largest_side && h >= largest_side))
        {
            temp.push_back('1');
        }
        else
        {
            temp.push_back('0');
        }

        cout << temp << endl;
    }
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll t;
    cin >> t;
    while (t--)
        solve();

    return 0;
}
