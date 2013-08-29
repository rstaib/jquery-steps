using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections.ObjectModel;
using System.Collections;

namespace JSteps.Web.Mvc
{
    /// <summary>
    /// Provides a read-only collection base for http accept request headers.
    /// </summary>
    /// <remarks>
    /// accept-encoding spec: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
    /// Note: The list is ordered by quality.
    /// </remarks>
    public abstract class AcceptRequestHeaderCollectionBase<T>
        : IList<T>
        where T : AcceptRequestHeaderItem
    {
        private static char _delimiters = ',';
        private static char[] _parameterDelimiters = { ';', '=' };

        private readonly List<T> _sortedItems;

        protected AcceptRequestHeaderCollectionBase(string header)
        {
            ArgumentValidation.ValidateArgument("header", header);

            if (!AcceptEmptyHeader)
            {
                throw new ArgumentException("Empty accept request header is not allowed.", "header");
            }

            _sortedItems = (from i in Parse(header) where (!i.IsAsterisk || AcceptAsterisk) &&
                (!i.IsEmpty || AcceptEmptyValue) orderby i.Quality descending select i).ToList();
        }

        #region Helper Methods

        private List<T> Parse(string header)
        {
            var items = new List<T>();

            var values = header.Split(_delimiters);
            foreach (var value in values)
            {
                var parameters = value.Split(_parameterDelimiters);
                var keyValuePairs = new Dictionary<string, string>();

                if (parameters.Count() > 1)
                {
                    var extensions = parameters.Skip(1).ToArray();
                    for (var i = 0; i < extensions.Count(); i = i + 2)
                    {
                        keyValuePairs.Add(extensions[i].Trim(), extensions[i + 1].Trim());
                    }
                }

                var item = CreateItem(parameters[0].Trim(), keyValuePairs);
                if (!item.IsEmpty || AcceptEmptyValue)
                {
                    items.Add(item);
                }
            }

            return items;
        }

        private static T CreateItem(string value, IDictionary<string, string> parameters)
        {
            var constructor = typeof(T).GetConstructor(new[] { value.GetType(), parameters.GetType() });
            return (T)constructor.Invoke(new object[] { value, parameters });
        }

        #endregion

        #region IList<T> Members

        public T this[int index]
        {
            get
            {
                return _sortedItems[index];
            }
            set
            {
                throw new NotSupportedException();
            }
        }

        public void Add(T item)
        {
            throw new NotSupportedException();
        }

        public void Clear()
        {
            throw new NotSupportedException();
        }

        public bool Contains(T item)
        {
            return _sortedItems.Contains(item);
        }

        public void CopyTo(T[] array, int arrayIndex)
        {
            _sortedItems.CopyTo(array, arrayIndex);
        }

        public int Count
        {
            get { return _sortedItems.Count(); }
        }

        public IEnumerator<T> GetEnumerator()
        {
            return _sortedItems.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return _sortedItems.GetEnumerator();
        }

        public int IndexOf(T item)
        {
            return _sortedItems.IndexOf(item);
        }

        public void Insert(int index, T item)
        {
            throw new NotSupportedException();
        }

        public bool IsReadOnly
        {
            get { return true; }
        }

        public bool Remove(T item)
        {
            throw new NotSupportedException();
        }

        public void RemoveAt(int index)
        {
            throw new NotSupportedException();
        }

        #endregion

        #region Methods & Properties

        /// <summary>
        /// Whether or not the asterisk (e.g. "*" or "*/*") encoding is available and allowed
        /// </summary>
        public abstract bool AcceptAsterisk { get; }

        /// <summary>
        /// Whether or not empty header is allowed
        /// </summary>
        public abstract bool AcceptEmptyHeader { get; }

        /// <summary>
        /// Whether or not empty value is allowed
        /// </summary>
        public abstract bool AcceptEmptyValue { get; }

        /// <summary>
        /// Searches for an element that matches the conditions defined by the specified predicate, 
        /// and returns the first occurrence within the entire collection.
        /// </summary>
        /// <param name="match">The <see cref="Predicate<T>"/> delegate that defines the conditions 
        /// of the element to search for.</param>
        /// <returns>The first element that matches the conditions defined by the specified predicate,
        /// if found; otherwise, the default value for type T.</returns>
        public T Find(Predicate<T> match)
        {
            return _sortedItems.Find(match);
        }

        /// <summary>
        /// Returns the first match found from the given canidates that is accepted
        /// </summary>
        /// <param name="canidates">The list of names to find</param>
        /// <returns>The first <see cref="T"/> match to be found</returns>
        public T FindAccepted(IEnumerable<string> canidates)
        {
            Predicate<T> predicate = (T i) =>
            {
                return (canidates.Any(a => a.Equals(i.Value, StringComparison.OrdinalIgnoreCase)) || 
                    i.IsAsterisk) && i.Accepted;
            };

            return Find(predicate);
        }

        #endregion
    }
}